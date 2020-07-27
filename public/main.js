const socket = io({autoConnect: false});
const canvas = document.getElementById('canvas');;
const ctx = canvas.getContext('2d');

const cdWidth = 240;
const cdHeight = 360;
const cards = new Image();
const back = new Image();

let room;
let hand = [];
let turn;
let playerName;

function init() {
  ctx.font = "12px Arial";
  canvas.style.backgroundColor = '#10ac84';
  cards.src = 'images/deck.svg';
  back.src = 'images/uno.svg';

  document.addEventListener('touchstart', onMouseClick, false);
  document.addEventListener('click', onMouseClick, false);

  playerName = getCookie('playerName');
  if (playerName == null) {
    playerName = prompt('Enter your name: ', 'Guest');
    if (playerName == null || playerName == "") {
      playerName = 'Guest';
    }
    setCookie('playerName', playerName, 24 * 3600);
  }

  socket.connect();
}

function setCookie(name, value, seconds) {
  let date = new Date();
  date.setTime(date.getTime() + (seconds * 1000));
  let expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
  name += "=";
  let cookies = document.cookie.split(';');
  for(let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) == ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) == 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return null;
}

socket.on('connect', requestRoom);
socket.on('confirmLeave', requestRoom);

function requestRoom() {
  socket.emit('requestRoom', playerName);
  room = 0;
  hand = [];
  turn = false;
  console.log('>> Room Request');
}

socket.on('responseRoom', function (name) {
  if (name != 'error') {
    room = name;
    console.log('<< Room Response: ' + name);
    ctx.fillText(name, 0, 10);
    ctx.drawImage(back, canvas.width-cdWidth/2-60, canvas.height/2-cdHeight/4, cdWidth/2, cdHeight/2);
    ctx.fillText(playerName, 100, 390);
  } else {
    socket.disconnect();
    alert('Rooms are full! Try again later');
  }
});

socket.on('countDown', function(countDown) {
  ctx.clearRect(0, 10, 15, 10);
  ctx.fillText(countDown, 0, 20);
});

socket.on('playerDisconnect', function() {
  //ctx.clearRect(0, 0, canvas.width, canvas.height);
  //socket.emit('leaveRoom', room);
  console.log('<< Player disconnected in ' + room);
});

function onMouseClick(e) {
  //TODO: fix offset
  let lastCard = canvas.offsetLeft + (hand.length/112)*(cdWidth/3)+(canvas.width/(2+(hand.length-1)))*(hand.length)-(cdWidth/4)+cdWidth/2;
  let initCard = canvas.offsetLeft + 2 + (hand.length/112)*(cdWidth/3)+(canvas.width/(2+(hand.length-1)))-(cdWidth/4);

  if (e.pageY >= 400 && e.pageY <= 580 && e.pageX >= initCard && e.pageX <= lastCard) {
    for (let i = 0, pos = initCard; i < hand.length; i++, pos += canvas.width/(2+(hand.length-1))) {
      if (e.pageX >= pos && e.pageX <= pos+canvas.width/(2+(hand.length-1))) {
        debugArea(pos, pos+canvas.width/(2+(hand.length-1)), 400, 580);
        socket.emit('playCard', [hand[i], room]);
        return;
      }
    }
  } else if (e.pageX >= canvas.width-cdWidth/2-60 &&  e.pageX <= canvas.width-60 &&
    e.pageY >= canvas.height/2-cdHeight/4 && e.pageY <= canvas.height/2+cdHeight/4) {
    socket.emit('drawCard', [1, room]);
  }
}

socket.on('turnPlayer', function(data) {
  if (data == socket.id) {
    turn = true;
    console.log('<< Your turn');
  } else {
    turn = false;
    console.log('<< Not your turn');
  }
});

socket.on('haveCard', function(nums) {
  hand = nums;
  ctx.clearRect(0, 400, canvas.width, canvas.height);
  for (let i = 0; i < hand.length; i++) {
    ctx.drawImage(cards, 1+cdWidth*(hand[i]%14), 1+cdHeight*Math.floor(hand[i]/14), cdWidth, cdHeight, (hand.length/112)*(cdWidth/3)+(canvas.width/(2+(hand.length-1)))*(i+1)-(cdWidth/4), 400, cdWidth/2, cdHeight/2);
    console.log('<< Have card: ' + hand[i]);
  }
});

socket.on('sendCard', function(num) {
  ctx.drawImage(cards, 1+cdWidth*(num%14), 1+cdHeight*Math.floor(num/14), cdWidth, cdHeight, canvas.width/2-cdWidth/4, canvas.height/2-cdHeight/4, cdWidth/2, cdHeight/2);
});

function debugArea(x1, x2, y1, y2) {
  ctx.beginPath();
  ctx.moveTo(0, y1);
  ctx.lineTo(canvas.width, y1);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, y2);
  ctx.lineTo(canvas.width, y2);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x1, 0);
  ctx.lineTo(x1, canvas.height);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, 0);
  ctx.lineTo(x2, canvas.height);
  ctx.closePath();
  ctx.stroke();
}

function chooseColor() {

  let cx = canvas.width / 2;
  let cy = canvas.height / 2;
  let r = cdHeight / 4;
  let colors = ['red', 'blue', 'green', 'gold'];

  for(let i = 0; i < 4; i++) {
      let startAngle = i * Math.PI / 2;
      let endAngle = startAngle + Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.stroke();
  }

  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText("Choose a color", canvas.width / 2, canvas.height / 2 - r - 10);
  ctx.textAlign = 'start';
}

init();
