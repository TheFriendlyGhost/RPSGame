var config = {
  apiKey: "AIzaSyCmMtdN3C4JaeAWBpfqcZVXE9XYBSJuRCE",
  authDomain: "rpsgame-5bf8e.firebaseapp.com",
  databaseURL: "https://rpsgame-5bf8e.firebaseio.com",
  projectId: "rpsgame-5bf8e",
  storageBucket: "",
  messagingSenderId: "534614129964"
};
firebase.initializeApp(config);

var database = firebase.database()

var player1 = null
var player2 = null

var player1Name = ''
var player2Name = ''

var currentPlayer = ''

var player1Choice = ''
var player2Choice = ''

var turn = 1

function decisionTree(){
  if(player1.choice === 'Rock'){
    if(player2.choice === 'Rock'){
      database.ref().child('/result/').set('Tie!!!')
    }else if(player2.choice === 'Paper'){
      database.ref().child('/result/').set(player2.name + ' Wins!')
    }else{
      database.ref().child('/result/').set(player1.name + ' Wins!')
    }
  }else if(player1.choice === 'Paper'){
    if(player2.choice === 'Rock'){
      database.ref().child('/result/').set(player1.name + ' Wins!')
    }else if(player2.choice === 'Paper'){
      database.ref().child('/result/').set('Tie!!!')
    }else{
      database.ref().child('/result/').set(player2.name + ' Wins!')
    }
  }else if(player1.choice === 'Scissors'){
    if(player2.choice === 'Rock'){
      database.ref().child('/result/').set(player2.name + ' Wins!')
    }else if(player2.choice === 'Paper'){
      database.ref().child('/result/').set(player1.name + ' Wins!')
    }else{
      database.ref().child('/result/').set('Tie!!!')
    }
  }
}

database.ref('/result/').on('value', function(snapshot){
  var sv = snapshot.val()

  $('#turn').text('Waiting for ' + player1.name + ' to choose again')
  $('#result').text(sv)
  database.ref('/turn').set(1)
})


database.ref('/players/').on('value', function(snapshot){
  var sv = snapshot.val()
  
  if(snapshot.child('player1').exists()){
    player1 = sv.player1
    player1Name = player1.name
    $('#waiting-player1').hide()
    $('#player-one').text(player1Name)
  }else{
    $('#waiting-player1').show()
    $('#player-one').text('Player One')
  }

  if(snapshot.child('player2').exists()){
    player2 = sv.player2
    player2Name = player2.name
    $('#waiting-player2').hide()
    $('#player-two').text(player2Name)
  }else{
    $('#waiting-player2').show()
    $('#player-two').text('Player Two')
  }
})

database.ref('/players/').on('child_removed', function(snapshot){
  database.ref().child('/turn').set(1)
  database.ref('/result').set('')

  var sv = snapshot.val()

  var message = sv.name + " has disconnected"
  
  database.ref('/chat/').push({
    message: message,
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  })
})

database.ref('/chat/').orderByChild("dateAdded").on('child_added', function(snapshot){
  var newMessage = snapshot.val().message
  console.log(newMessage, snapshot.val().dateAdded)
  var newChatLine = $('<div>')
  newChatLine.text(newMessage)

  $('#chatroom').append(newChatLine)
  $("#chatroom").scrollTop($("#chatroom")[0].scrollHeight);

})
database.ref('/turn/').on('value', function(snapshot){
  var sv = snapshot.val()

  if(sv === 1){
    turn = 1
  }else if(sv === 2){
    turn = 2
  }
})

$(document.body).on('click', '#add-player', function(event){
  event.preventDefault()

  if(($('#new-player').val().trim() !== '') && !(player1 && player2)){
    if (player1 === null) {
      currentPlayer = $('#new-player').val().trim()
      
      player1 = {
        name: currentPlayer,
        choice: ''
      }

      database.ref().child('/players/player1').set(player1)
      database.ref().child('/turn').set(1)

      database.ref('/players/player1').onDisconnect().remove()

    }else if((player1 !== null) && (player2 === null)){
      currentPlayer = $('#new-player').val().trim()
      
      player2 = {
        name: currentPlayer,
        choice: ''
      }

      database.ref().child('/players/player2').set(player2)
      database.ref('/players/player2').onDisconnect().remove()

      $('#turn').text('Waiting for ' + player1.name+ ' to choose').show()
    }
  }

  $('#new-player').val('')
})

$('#player-one-box').on('click', '.choiceBtn', function(event){
  event.preventDefault()
  if(player1 && player2 && (currentPlayer === player1.name) && (turn === 1)){
    console.log('here', player1, player2, currentPlayer, turn)

    var choice = $(this).text()
    console.log(choice)
    player1Choice = choice

    database.ref().child('/players/player1/choice').set(choice)
    turn = 2

    database.ref().child('/turn').set(2)

    $('#turn').text('Waiting for ' + player2.name + ' to choose')
    $('#turn').show()
  }
})

$('#player-two-box').on('click', '.choiceBtn', function(event){
  event.preventDefault()

  if(player1 && player2 && (currentPlayer === player2.name) && (turn === 2)){
    console.log('here', player1, player2, currentPlayer, turn)
    
    var choice = $(this).text()
    player2Choice = choice

    database.ref().child('/players/player2/choice').set(choice)
    turn = 2

    database.ref().child('/turn').set(2)
    $('#turn').empty()

    decisionTree()
  }
})

$('#chat-send').on('click', function(event){
  event.preventDefault()

  if(currentPlayer !== "" && $('#chat-input').val().trim() !== ""){
    var message = currentPlayer + ": " + $('#chat-input').val().trim()
    $('#chat-input').val('')

    database.ref('/chat/').push({
      message: message,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    })
  }
})
// $(document).ready(function(){
//   var arr = ['Rock', 'Paper', 'Scissors']
      
//   for (var i = 0; i < arr.length; i++) {
//     var button = $('<button class="btn btn-primary ml-3 mb-1 choiceBtn">')
//     var newRow = $('<div class="row choiceRow'+i+'">')

//     button.text(arr[i])
//     newRow.append(button)

//     $('#player-one').append(newRow)
//     $('.choiceRow'+i).clone().appendTo('#player-two')
//   }
// })

