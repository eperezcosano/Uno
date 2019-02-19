'use strict';

(function() {
  const cdWidth = 240;
  const cdHeight = 360;

  var socket = io();
  var canvas = document.getElementById('canvas');;
  var ctx = canvas.getContext('2d');
  var cards = new Image();
  var back = new Image();

  var room = 0;
  var hand = [];
  var turn = false;

  document.addEventListener("click", onMouseClick, false);

  canvas.style.backgroundColor = '#10ac84';
  cards.src = 'images/deck.svg';
  back.onload = function() {
    ctx.drawImage(back, canvas.width-cdWidth/2-60, canvas.height/2-cdHeight/4, cdWidth/2, cdHeight/2);
  }
  back.src = 'images/uno.svg';

  function onMouseClick(e) {
    var lastcard = (hand.length/112)*(cdWidth/3)+(canvas.width/(2+(hand.length-1)))*(hand.length)-(cdWidth/4)+cdWidth/2;
    var initcard = 2+(hand.length/112)*(cdWidth/3)+(canvas.width/(2+(hand.length-1)))-(cdWidth/4);

    if (e.pageY >= 400 && e.pageY <= 580 && e.pageX >= initcard && e.pageX <= lastcard) {
      for (var i = 0, pos = initcard; i < hand.length; i++, pos += canvas.width/(2+(hand.length-1))) {
        if (e.pageX >= pos && e.pageX <= pos+canvas.width/(2+(hand.length-1))) {
          socket.emit('playCard', [hand[i], room]);
          return;
        }
      }
      socket.emit('playCard', [hand[i], room]);
    } else if (e.pageX >= canvas.width-cdWidth/2-60 &&  e.pageX <= canvas.width-60 &&
      e.pageY >= canvas.height/2-cdHeight/4 && e.pageY <= canvas.height/2+cdHeight/4) {
      socket.emit('drawCard', [1, room]);
    }
  }

  socket.on('connect', ReqRoom);

  socket.on('responseRoom', function (name) {
    if (name != 'error') {
      room = name;
      console.log('Room Response: '+name);
      socket.emit('requestGame', name);
    } else {
      alert('Rooms are full! Try again later.');
      socket.disconnect();
    }
  });

  socket.on('turnPlayer', function(data) {
    console.log(data);
    if (data == socket.id) {
      turn = true;
      console.log('Your turn');
    } else {
      turn = false;
      console.log('Not your turn');
    }
  });

  socket.on('haveCard', function(nums) {
    hand = nums;
    ctx.clearRect(0, 400, canvas.width, canvas.height);
    for (var i = 0; i < hand.length; i++) {
      ctx.drawImage(cards, 1+cdWidth*(hand[i]%14), 1+cdHeight*Math.floor(hand[i]/14), cdWidth, cdHeight, (hand.length/112)*(cdWidth/3)+(canvas.width/(2+(hand.length-1)))*(i+1)-(cdWidth/4), 400, cdWidth/2, cdHeight/2);
      console.log('Have card: '+hand[i]);
    }
  });

  socket.on('sendCard', function(num) {
    ctx.drawImage(cards, 1+cdWidth*(num%14), 1+cdHeight*Math.floor(num/14), cdWidth, cdHeight, canvas.width/2-cdWidth/4, canvas.height/2-cdHeight/4, cdWidth/2, cdHeight/2);
  });

  socket.on('playerDisconnect', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('leaveRoom', room);
    console.log('Player Disconnected');
  });

  socket.on('confirmLeave', ReqRoom);

  function ReqRoom() {
    socket.emit('requestRoom');
    room = 0;
    hand = [];
    turn = false;
    console.log('Room Request');
  }

})();
