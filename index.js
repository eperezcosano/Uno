const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
io.on('connection', onConnection);
http.listen(port, () => console.log('listening on port ' + port));

var ch = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5];
var id = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var numbers = Array.apply(null, Array(112)).map(function (_, i) {return i;});
var deck1 = numbers;
numbers.splice(56, 1);
numbers.splice(69, 1); //70
numbers.splice(82, 1); //84
numbers.splice(95, 1); //98

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
}

function onConnection(socket){

  socket.channel = "";

  socket.on('requestChannel', function() {
    var ch0 = ch.shift();
    socket.channel = ch0;
    console.log('User connected on channel: '+ch0);
    console.log(id);
    console.log(ch);
    io.to(socket.id).emit('responseChannel', ch0);
  });

  socket.on('confirmationChannel', function() {
    var ch0 = socket.channel;
    var id0 = socket.id;
    if (ch0 == ch[0]) {
      console.log('Waiting for opponent on channel: '+ch0);
      id[ch0*2-2] = id0;
      io.to(id0).emit('responsePlayer', 'Player 1');
    }
    else if (ch0 != ch[0] && id[ch0*2-2] != 0) {
      console.log('Opponent found for channel: '+ch0);
      id[ch0*2-1] = id0;
      io.to(id0).emit('responsePlayer', 'Player 2');
      console.log('Starting game on channel: '+ch0);

      var Player1 = id[ch0*2-2];
      var Player2 = id[ch0*2-1];
      shuffle(deck1);
      var turn = 1;
      var hand1 = [];
      var hand2 = [];

      for (var i = 0; i < 14; i++) {
        var card = deck1.shift();
        if (turn == 1) {
          hand1.push(card);
          turn = 2;
        } else if (turn == 2) {
          hand2.push(card);
          turn = 1;
        }
        deck1.push(card);
      }

      var initCard = deck1.shift();
      io.to(Player1).emit('haveCard', hand1);
      io.to(Player1).emit('sendCard', initCard);

      io.to(Player2).emit('haveCard', hand2);
      io.to(Player2).emit('sendCard', initCard);

      deck1.push(initCard);

    }
  });

  socket.on('message', function (data) {
    socket.broadcast.emit('message', {
      channel: socket.channel,
      message: data.message
    });
  });

  socket.on('disconnect', function(){
    var ch0 = socket.channel;
    io.to(id[ch0*2-2]).emit('PlayerDisconnect');
    id[ch0*2-2] = 0;
    io.to(id[ch0*2-1]).emit('PlayerDisconnect');
    id[ch0*2-1] = 0;
    ch.unshift(ch0);
    ch.unshift(ch0);
    console.log('User disconnected on channel: '+ch0);
    console.log(id);
    console.log(ch);
  });
}
