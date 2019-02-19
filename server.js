const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
io.on('connection', onConnection);
http.listen(port, () => console.log('listening on port ' + port));

const numRooms = 3;

var numbers = Array.apply(null, Array(112)).map(function (_, i) {return i;});
var deck = numbers;
var data = [];
for (var i = 1; i <= numRooms; i++) {
  var room = [];
  room['deck'] = [];
  room['cycle'] = 1;
  room['turn'] = 0;
  room['cdtb'] = 0;
  var players = [];
  for (var j = 0; j < 2; j++) {
    var p = [];
    p['id'] = 0;
    p['hand'] = [];
    players[j] = p;
  }
  room['players'] = players;
  data['Room_'+i] = room;
}

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

function cardColor(num) {
  var color;
  if (num%14 == 13) {
    return 'black';
  }
  switch (Math.floor(num/14)) {
    case 0:
    case 4:
      color = 'red';
      break;
    case 1:
    case 5:
      color = 'yellow';
      break;
    case 2:
    case 6:
      color = 'green';
      break;
    case 3:
    case 7:
      color = 'blue';
      break;
  }
  return color;
}

function onConnection(socket){

  socket.on('drawCard', function(res) {
    var numplayer = data[res[1]]['turn'];
    var idplayer = data[res[1]]['players'][numplayer]['id'];

    if (idplayer == socket.id) {
      var card = parseInt(deck.shift());
      data[res[1]]['players'][numplayer]['hand'].push(card);
      io.to(idplayer).emit('haveCard', data[res[1]]['players'][numplayer]['hand']);
      deck.push(card);
      if (data[res[1]]['cycle'] == 1) {
        numplayer = (numplayer+1)%2;
      } else {
        numplayer = Math.abs(numplayer-1)%2;
      }
      data[res[1]]['turn'] = numplayer;
      io.to(res[1]).emit('turnPlayer', data[res[1]]['players'][numplayer]['id']);
    }
  });

  socket.on('playCard', function(res) {
    var numplayer = data[res[1]]['turn'];
    var idplayer = data[res[1]]['players'][numplayer]['id'];
    if (idplayer == socket.id) {
      var Pcolor = cardColor(res[0]);
      var Pnum = res[0]%14;

      var Tcolor = cardColor(data[res[1]]['cdtb']);
      var Tnum = data[res[1]]['cdtb']%14;

      if (Pnum == 13) {
        //Comodines
      } else if (Pcolor == Tcolor || Pnum == Tnum) {
        //Tirar carta
        io.to(res[1]).emit('sendCard', res[0]);
        data[res[1]]['cdtb'] = res[0];
        //Quitar carta
        var h = data[res[1]]['players'][numplayer]['hand'].indexOf(res[0]);
        if (h > -1) {
          data[res[1]]['players'][numplayer]['hand'].splice(h, 1);
        }
        io.to(idplayer).emit('haveCard', data[res[1]]['players'][numplayer]['hand']);

        //Siguiente turno
        if (Pnum != 10) {
          if (Pnum == 11) {
            data[res[1]]['cycle'] = (data[res[1]]['cycle']+1)%2;
          }
          if (data[res[1]]['cycle'] == 1) {
            numplayer = (numplayer+1)%2;
          } else if (cycle == 0) {
            numplayer = Math.abs(numplayer-1)%2;
          }
          data[res[1]]['turn'] = numplayer;
        }
        io.to(res[1]).emit('turnPlayer', data[res[1]]['players'][numplayer]['id']);

      }
    }
  });

  socket.on('leaveRoom', function(room) {
    if (room != 0 && room !== 'undefinded') {
      socket.leave(room);
      console.log('>> User leaving '+room);
      io.to(socket.id).emit('confirmLeave');
    }
  });

  socket.on('requestRoom', function() {
    for (var i = 1, k = 1; i <= numRooms; i++) {
      var name = 'Room_'+i;
      try {
        var people = io.sockets.adapter.rooms[name].length;
      } catch (e) {
        var people = 0;
      }
      if (people == k) {
        socket.join(name);
        console.log('>> User connected on '+name);
        io.to(socket.id).emit('responseRoom', name);
        return;
      }
      if (k == 1 && i == numRooms) {
        k = 0;
        i = 0;
      }
    }
    io.to(socket.id).emit('responseRoom', 'error');
    console.log('>> Rooms exceeded');
  });

  socket.on('requestGame', function(name) {
    try {
      var people = io.sockets.adapter.rooms[name].length;
    } catch (e) {
      var people = 0;
    }
    if (people == 2) {
      console.log('>> Starting game on '+name);
      var rnd = Math.round(Math.random());
      var add = Object.keys(io.sockets.adapter.rooms[name].sockets);
      var hand1 = [];
      var hand2 = [];

      if (rnd == 0) {
        var Player1 = add[0];
        var Player2 = add[1];
      } else if (rnd == 1) {
        var Player1 = add[1];
        var Player2 = add[0];
      }
      shuffle(deck);
      data[name]['deck'] = deck;
      data[name]['turn'] = rnd;
      data[name]['players'][0]['id'] = Player1;
      data[name]['players'][1]['id'] = Player2;

      for (var i = 0, j = 0; i < 14; i++) {
        var card = parseInt(deck.shift());
        if (j == 0) {
          hand1.push(card);
          j = 1;
        } else if (j == 1) {
          hand2.push(card);
          j = 0;
        }
        deck.push(card);
      }

      var initCard = deck.shift();
      data[name]['cdtb'] = initCard;
      data[name]['players'][0]['hand'] = hand1;
      data[name]['players'][1]['hand'] = hand2;


      io.to(Player1).emit('haveCard', hand1);
      io.to(Player2).emit('haveCard', hand2);
      deck.push(initCard);
      io.to(name).emit('turnPlayer', Player1);
      io.to(name).emit('sendCard', initCard);
    }
  });

  socket.on('disconnecting', function() {
    room = Object.keys(io.sockets.adapter.sids[socket.id])[1];
    io.to(room).emit('playerDisconnect', room);
    console.log('>> User leaving '+room);
  });

  socket.on('disconnect', function(){
    console.log('>> User disconnected');
  });
}
