'use strict';

(function() {
  const cdWidth = 240;
  const cdHeight = 360;

  var canvas = document.getElementById('canvas');;
  var ctx = canvas.getContext('2d');
  var cards = new Image();
  var back = new Image();
  var room = '';
  var hand = Array.apply(null, Array(7)).map(function (_, i) {return i;});
  var turn = false;

  document.addEventListener("click", onMouseClick, false);

  function onMouseClick(e) {
    console.log(e);
    var lastcard = (hand.length/112)*(cdWidth/3)+(canvas.width/(2+(hand.length-1)))*(hand.length)-(cdWidth/4)+cdWidth/2;
    var initcard = 2+(hand.length/112)*(cdWidth/3)+(canvas.width/(2+(hand.length-1)))-(cdWidth/4);

    if (e.clientY >= 400 && e.clientY <= 580 && e.clientX >= initcard && e.clientX <= lastcard) {
      for (var i = 0, pos = initcard; i < hand.length; i++, pos += canvas.width/(2+(hand.length-1))) {
        if (e.clientX >= pos && e.clientX <= pos+canvas.width/(2+(hand.length-1))) {
          console.log(i);
          return;
        }
      }
      console.log(hand.length-1);
    }
  }

  canvas.style.backgroundColor = '#10ac84';
  cards.onload = function() {
    for (var i = 0; i < hand.length; i++) {
      ctx.drawImage(cards, 1+cdWidth*(hand[i]%14), 1+cdHeight*Math.floor(hand[i]/14), cdWidth, cdHeight, (hand.length/112)*(cdWidth/3)+(canvas.width/(2+(hand.length-1)))*(i+1)-(cdWidth/4), 400, cdWidth/2, cdHeight/2);
      console.log('Have card: '+hand[i]);
    }
  }
  cards.src = 'images/deck.svg';
})();
