# Creating the UNO game on JavaScript
---
## Creating a simple socket.IO server from scratch and build the UNO game from the base
* [Part I](https://eperezcosano.github.io/uno-part1/)
* [Part II](https://eperezcosano.github.io/uno-part2/)

---
## To-Do List
- [ ] Choose colour interface.
- [ ] What to do when someone disconnects.
- [ ] In the endgame, saying UNO. 
- [ ] What to do when winning or losing.
- [ ] Draw more than one card.
- [ ] Special cards functions.
---

## Part I

In this article, I am going to explain step by step everything I came up to create the popular UNO game from scratch just in a simple canvas for the end-user that is going to play giving them a lightest client, just the browser. To do so, all code is in JavaScript. On the server-side, we manage a Node.JS server to attend all requests performed by users connected through SocketIO.

---
## Contents
1. [Setting up the server](#setting-up-the-server)
	* [The Web Framework](#the-web-framework)
	* [Integrating Socket.IO](#integrating-socketio)
2. [Project Structure](#project-structure)
	*  [Deck of cards](#deck-of-cards)
3. [Loop through the deck of cards](#loop-through-the-deck-of-cards)
- - - -

## Setting up the server
The first goal is to set up a simple HTML webpage that serves out an empty canvas. We are just only going to use two dependencies, [Express](https://expressjs.com) as the web framework and [Socket.IO](socket.io) as the real-time engine.

Let’s start with an empty node project. We create a `package.json` manifest file that describes our project. It is recommended to place it in a new empty directory, I will call mine `socket-uno`.

```
$ npm init
```

`package.json`:
```json
{
  "name": "socket-uno",
  "version": "0.0.1",
  "description": "UNO game on javascript",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/eperezcosano/Uno.git"
  },
  "author": "Izan Pérez Cosano",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/eperezcosano/Uno/issues"
  },
  "homepage": "https://github.com/eperezcosano/Uno#readme",
  "dependencies": {}
}
```

This could be a completed `package.json`. On my case, I filled up more than the necessary fields like my [GitHub Repo](https://github.com/eperezcosano/Uno.git) and others, but it is fine with only a minified version _(name, version, description and dependencies)_.

### The Web Framework
Now, to easily populate the `dependencies` property with the things we need, we will use `npm`:

```
$ npm install express --save
```

Once installed, we create a new directory called `public` that is going to be the root directory served. Within it,  we are going to place a simple `index.html` with just a line of _Hello World_ to test it out.

```html
<h1>Hello world</h1>
```

And outside them, in the main directory, we define our `server.js` file that will set up our application.

```javascript
const express = require('express');
const app = express();
const http = require('http').Server(app);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
http.listen(port, () => console.log('listening on port ' + port));
```

This means that Express initializes `app` to be a function handle that you can supply to an HTTP server _(line 3)_ and listen on port **3000**, using the `/public` as the root directory.

If you run `node server.js` you should see the following:
![](https://eperezcosano.github.io/static/8e7789abdb8b93ca3a7ef97174476025/c83ae/terminal_1.png)

And if you point your browser to `http://localhost:3000`:
![](https://eperezcosano.github.io/static/086f709e3e76c3154c2a6d8133a0c949/c83ae/web_1.png)

### Integrating Socket.IO

Socket.IO is composed of two parts:
* A server that integrates the Node.JS HTTP Server.
* A client library that loads on the browser side.

During development, `socket.io` serves the client automatically for us, as we will see, so for now we only have to install one module:

```
$ npm install socket.io
```

That will install the module and add the dependency to `package.json`. Now let’s edit `server.js` to add it:

```javascript
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
io.on('connection', onConnection);
http.listen(port, () => console.log('listening on port ' + port));

function onConnection(socket) {
   console.log('a user connected');
}
```

Notice that it listen on the `connection` event for incoming sockets and log it to the console.

Now within `index.html` add the following snippet before the end body tag `</body>`:

```html
<script src="/socket.io/socket.io.js"></script>
<script>
   var socket = io();
</script>
```

That is all it takes to load the `socket.io` on the client-side. Reload the webpage several times and we will get our expected result:
![](https://eperezcosano.github.io/static/fbb59e2c978f0878c2c6405f9fe06d84/c83ae/terminal_2.png)
- - - -

## Project Structure
Now we are ready to start our project, on the client-side we will use three files: `index.html`, `style.css` and `main.js`.

In `index.html` we will set these lines in order to create a canvas and use our own styles and JavaScript code:

```html
<!DOCTYPE HTML>
<html lang="en">
  <head>
     <meta charset="UTF-8">
    <link rel="stylesheet" href="style.css">
    <link rel="icon" type="image/svg" href="images/uno.svg">
    <title>Uno</title>
  </head>
  <body>
    <canvas id="canvas" width="1000" height="600"></canvas>
    <script src="/socket.io/socket.io.js"></script>
    <script src="/main.js"></script>
  </body>
</html>
```

Then we will create a `style.css` as our stylesheet file:
```css
html, body {
  margin: 0;
  padding: 0;
  background-color: #00897B;
}

canvas {
  margin: auto;
  display: block;
}
```

Also, we will create a new directory for the UNO deck of cards images (`/public/images/`).

### Deck of cards
* Full view

![Deck](https://raw.githubusercontent.com/eperezcosano/Uno/master/public/images/deck.svg)
* Back side

![Back](https://raw.githubusercontent.com/eperezcosano/Uno/master/public/images/uno.svg)

And within the `main.js` file there is going to be coded all the game on the client-side.

By last, within the `server.js` file will be coded the rest of the game on the server-side.

---
## Loop through the deck of cards
Let’s now focus on how we are going to manage the cards display for the client-side. Since we only have one image of a full view of all the cards, we want to get one by one each by looping through the image a little chunk that will be the card in question.

Look to the [deck](#deck-of-cards) structure, we can extract the following patterns:

* Each row consist of **14 cards** of the _same colour_ except for the last one that is a Wild card (either a Wild or a Wild Draw 4).
* There are **4 colours** in total and appearing twice, so there are **8 rows** overall.
* The sequence goes from **0 to 9** card numbers and consequently goes the **Skip,  Reverse, Draw 2** and **Wild/Wild Draw 4** cards.
* The only **two differences** between the first group of 4 rows and the second is that the first one has the **0 card number** and **the Wild card** whereas in the second has the **Wild Draw 4** instead and _4 blank cards_.
* Blank cards are not playable so we have to _discard them_ from the deck and for the following explanations they are not considered.

Let’s imagine all cards piled up, in total there are **108**. We are going to label each card with a number. Now, for any number inside this range, how we are going to know what position in the rows and columns image is located? Let’s find it out.

To find which column the card belongs to, we need a formula that given any position, the result is always within the range between **0 and 14**. This reminds me to use modular algebra to solve this problem.

`card mod 14 = column`

Being `card` the number in the deck and `column` the position in the image, this formula solves the problem of locating the card in the **columns position**.

What about finding on what row belongs to? In this case, the formula needed is somehow one that goes from **1 to 8** and remaining on the same value for each **multiple of 14**. The solution is just doing a simple division and rounding down the result.

`⌊ card / 14 ⌋ = row`

Since there are 112 card numbers _(blanks are not considered, but the following cards have their position number according to the picture)_ this formula provides the **row position** of any card in the deck.

Summarizing everything, we can write the following two functions that will be very useful for us to later handle the cards depending on their colour and card type.

```javascript
/**
 * Given a card number, returns its color
 * @function
 * @param {Number} num Number of the card position in deck
 * @return {String} Card color. Either black, red, yellow, green or blue.
 */
function cardColor(num) {
  let color;
  if (num % 14 === 13) {
    return 'black';
  }
  switch (Math.floor(num / 14)) {
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

/**
 * Given a card number, returns its type
 * @function
 * @param {Number} num Number of the card position in deck
 * @return {String} Card type. Either skip, reverse, draw2, draw4, wild or number.
 */
function cardType(num) {
  switch (num % 14) {
    case 10: //Skip
      return 'Skip';
    case 11: //Reverse
      return 'Reverse';
    case 12: //Draw 2
      return 'Draw2';
    case 13: //Wild or Wild Draw 4
      if (Math.floor(num / 14) >= 4) {
        return 'Draw4';
      } else {
        return 'Wild';
      }
    default:
      return 'Number ' + (num % 14);
  }
}
```
---

## Part II

Here there is a continuation of the [last article](https://eperezcosano.github.io/uno-part1/) explaining how to start a  project to achieve a basic client-server side installation and a few concepts to how to loop through the deck of cards by associating numbers to each card. In this part, let’s start by creating the protocol will follow the client to connect to the server such as the messages and parameters exchanges.

---
## Contents
1. [Server-side preparations](#server-side-preparations)
    * [Recap](#recap)
    * [Rooms and players](#rooms-and-players)
    * [The deck of cards](#the-deck-of-cards)
    * [Game Data](#game-data)
2. [Client-side preparations](#client-side-preparations)
    * [Connection](#connection)
    * [Player name and Cookies](#player-name-and-cookies)
    * [Canvas initialitation](#canvas-initialitation)
3. [Connection protocol](#connection-protocol)
    * [Room request](#room-request)
    * [Room Response](#room-response)
4. [Starting a new game](#starting-a-new-game)
5. [Handling players disconnection](#handling-players-disconnection)
6. [Drawing or playing a card](#drawing-or-playing-a-card)
    * [Coordinate system](#coordinate-system)
    * [Drawing a card](#drawing-a-card)
    * [Playing a card](#playing-a-card)
    * [Printing the results](#printing-the-results)
7. [To-Do List](#to-do-list)

---
## Server-side preparations
### Recap
In summary, as seen before, the server starts by performing this first lines of code:

```javascript
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
io.on('connection', onConnection);
http.listen(port, () => console.log('listening on port ' + port));
```
### Rooms and players
The way I think the game could be playable by several groups of people is to define _Rooms_.  The idea is that within each room will be running a UNO game and will be isolated by the other rooms, so different groups of players can join. 

At this point, we have to write the game rules in our code, I have chosen the [official UNO rules from this sheet](https://service.mattel.com/instruction_sheets/42001pr.pdf).

We can be starting by creating a couple of constants indicating the maximum of rooms the server could handle and how many people can be within each room.

```javascript
const numRooms = 5;
const maxPeople = 10;
```

### The deck of cards
Let’s continue by defining the deck of cards, as seen before, each card will be represented by consecutive numbers up to 112. So a simple array storing these numbers will be the representation of the actual deck of cards.

```javascript
let deck = Array.apply(null, Array(112)).map(function (_, i) {return i;});
```

However, keep in mind that there are 112 is because there are blank cards, but since we need to discard them to play, we use the _slice_ function in order remove the element from the array. Notice that the cards following a blank card will stay the same, as we want the _actual position in the deck scheme image_, so, for example, the first blank card is in the 56th position and by discarding it, its neighbours stay at 55 and 57. The following code is performed for the four blank cards.

```javascript
deck.splice(56, 1); //56
deck.splice(69, 1); //70
deck.splice(82, 1); //84
deck.splice(95, 1); //98
```

Last but not least, is to define a `shuffle function that will be pretty handy to deliver a shuffled deck to every room.

```javascript
/**
 * Shuffles all elements in array
 * @function
 * @param {Array} to shuffle
 */
function shuffle(a) {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
}
```

### Game data
_How will the server remember whose turn is it or what card is the table to calculate a legal play?_ The easiest solution is by creating an array on the flight right before starting any game which will store vary useful information for the progression of the game, such as, the actual remaining deck, the reverse orientation turn, card on board, and the information of the players: names, cards on hand, etcetera. Further details will be explained as we continue.  So this code will create an array on which room is stored as `data[Room_N]` being `N` the current number room.

```javascript
let data = [];
for (let i = 1; i <= numRooms; i++) {
  let room = [];
  room['timeout'] = [];
  room['timeout']['id'] = 0;
  room['timeout']['s'] = 10;
  room['deck'] = [];
  room['reverse'] = 0;
  room['turn'] = 0;
  room['cardOnBoard'] = 0;
  room['people'] = 0;
  let players = [];
  for (let j = 0; j < maxPeople; j++) {
    let p = [];
    p['id'] = 0;
    p['name'] = "";
    p['hand'] = [];
    players[j] = p;
  }
  room['players'] = players;
  data['Room_'+i] = room;
}
```

---
## Client-side preparations
As seen before, within the `main.js` file there is going to be coded all the game on the client-side.

### Connection
Let’s see the first lines of code that will be performed:

```javascript
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
```

We define our `socket` with the flag `autoConnect` to **false**, as we want to define first the player name before connecting to the server. We can see both constants `cdWidth` and `cdHeight` that are the card dimensions within the [deck image](https://eperezcosano.github.io/uno-part1/#deck-of-cards), and finally a few variables that we will use as the `data` of the client to manage the progress of the game.

### Player name and Cookies
For the player name, I think that the best transparent solution is to ask it just once and store it as a cookie in the browser. These two following functions allow us to set and get a cookie in JavaScript.

```javascript
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
```

So the first time we play the browser will launch an alert form to fill our name and store it as a cookie, the client will start doing this in the init function which is this the actual first function performing.

### Canvas initialitation
```javascript
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
```

First lines are for styling the font, background and loading both deck images to the canvas. Then defines `click` and `touchstart` events that will fire the functions to decide on where the player clicks on the screen (_or touches if is on mobile browser_). At line 10 starts performing the task of asking the player name. If none is filled will be named as `Guest` the cookie will expire in 24 hours. Finally, the socket performs the connection.

---
## Connection protocol
### Room request
If the connection is successful, the following function is executed to request a room to the server.

```javascript
socket.on('connect', requestRoom);

function requestRoom() {
  socket.emit('requestRoom', playerName);
  room = 0;
  hand = [];
  turn = false;
  console.log('>> Room Request');
}
```

The server will receive the request and remember that from this point all code is executed from the `onConnection` function as the socket is already linked.

Whenever a room is requested, looks for a slot for the player, up to 10 players in a room, `maxRooms` and started games are respected.

```javascript
/**
 * Whenever a client connects
 * @function
 * @param {Socket} socket Client socket
 */
function onConnection(socket) {

  /**
   * Whenever a room is requested, looks for a slot for the player,
   * up to 10 players in a room, maxRooms and started games are respected.
   * @method
   * @param {String} playerName Player name
   * @return responseRoom with the name of the room, otherwise error.
   */
  socket.on('requestRoom', function(playerName) {
    socket.playerName = playerName;
    for (let i = 1; i <= numRooms; i++) {
      let name = 'Room_' + i;
      let people;
      try {
        people = io.sockets.adapter.rooms[name].length;
      } catch (e) {
        people = 0;
      }
      if (people < maxPeople && data[name]['timeout']['s'] > 0) {
        socket.join(name);
        console.log('>> User ' + socket.playerName +
        ' connected on ' + name + ' (' + (people + 1) + '/' + maxPeople + ')');
        io.to(socket.id).emit('responseRoom', name);
        if (people + 1 >= 2) {
          clearInterval(data[name]['timeout']['id']);
          data[name]['timeout']['s'] = 10;
          data[name]['timeout']['id'] = setInterval(function() {
            startingCountdown(name);
          }, 1000);
        }
        return;
      }
    }
    io.to(socket.id).emit('responseRoom', 'error');
    console.log('>> Rooms exceeded');
  });
```

Notice that here comes into play a timeout variable. This is because we need to check if a room has already started a game so it will not be possible to join more people. So the way it works is that when the minimum amount of people to play is reached (_according to the rules are 2 people_) a countdown starts. If anyone more joins the timer starts again from the top and when reaches 0 starts a game. So in summary, every room is open if the timer is still positive and there are less of the maximum amount of players (_according to the rules are 10 people_).

This is the function that is executed every second whenever the countdown is active.

```javascript
/**
 * Starts a countdown for start a game on a room
 * @function
 * @param {String} name Room name
 */
function startingCountdown(name) {
  let countDown = data[name]['timeout']['s']--;
  io.to(name).emit('countDown', countDown);
  console.log('>> ' + name + ': Starting in ' + countDown);
  if (countDown <= 0) {
    clearInterval(data[name]['timeout']['id']);
    startGame(name);
  }
}
```

Remember that every room would have a separated countdown and this is the reason it is stored inside the variable `data` for each room.

### Room Response
On the client-side, these two events will be fired upon then.

```javascript
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
```

The `responseRoom` event will either set up the room by drawing the back card image as representing the deck on the board or if there was an error due to the number of rooms are exceeded thus disconnecting the socket.

When within the room waiting for more players, the `countDown` event is triggered every second to inform the current situation to the player: drawing a countdown on the canvas.

---
## Starting a new game
The function that starts a game first checks again if there are at least 2 people in the room.

```javascript
/**
 * Request for start the game.
 * @param {String} name Room name
 */
function startGame(name) {
  console.log('>> ' + name + ': Requesting game...');
  let people;
  try {
    people = io.sockets.adapter.rooms[name].length;
  } catch (e) {
    console.log('>> ' + name + ': No people here...');
    return;
  }
```

Then it assigns every socket id with its player’s name and stores it in the data array of the room

```javascript
  if (people >= 2) {
    console.log('>> ' + name + ': Starting');
    let sockets_ids = Object.keys(io.sockets.adapter.rooms[name].sockets);
    for (let i = 0; i < people; i++) {
      data[name]['players'][i]['id'] = sockets_ids[i];
      let playerName = io.sockets.sockets[sockets_ids[i]].playerName;
      data[name]['players'][i]['name'] = playerName;
      console.log('>> ' + name + ': ' + playerName +
                ' (' + sockets_ids[i] + ') is Player ' + i);
    }

    data[name]['people'] = people;
```

Doing so, later on, we could read easily how many people there are, which are their names and their socket addresses to exchange messages with them.

Once all the data is ready, it is time to shuffle the deck and deal the cards

```javascript
    //Shuffle a copy of a new deck
    let newDeck = [...deck];
    shuffle(newDeck);
    data[name]['deck'] = newDeck;
    console.log('>> ' + name + ': Shuffling deck');
```

According to the rules, we have to choose a dealer first and to do so, every player draws a card and who has the higher score is the dealer. Let’s define a function which calculates the score of each card.

```javascript
/**
 * Given a card number, returns its scoring
 * @function
 * @param {Number} num Number of the card position in deck
 * @return {Number} Points value.
 */
function cardScore(num) {
  let points;
  switch (num % 14) {
    case 10: //Skip
    case 11: //Reverse
    case 12: //Draw 2
      points = 20;
      break;
    case 13: //Wild or Wild Draw 4
      points = 50;
      break;
    default:
      points = num % 14;
      break;
  }
  return points;
}
```

Now we do that every player draws a card to choose who will be the dealer. In case of a tie, we repeat the process.

```javascript
//Every player draws a card.
//Player with the highest point value is the dealer.
let scores = new Array(people);
do {
	console.log('>> ' + name + ': Deciding dealer');
  	for (let i = 0, card = 0, score = 0; i < people; i++) {
  	card = parseInt(newDeck.shift());
  		newDeck.push(card);
      score = cardScore(card);
      console.log('>> ' + name + ': Player ' + i + ' draws ' + cardType(card) + ' ' + cardColor(card) + ' and gets ' + score + ' points');
       scores[i] = score;
   }
} while (new Set(scores).size !== scores.length);

let dealer = scores.indexOf(Math.max(...scores));
console.log('>> ' + name + ': The dealer is Player ' + dealer);
```

Whoever has been the dealer, each player is dealt 7 cards.

```javascript
for (let i = 0, card = 0; i < people * 7; i++) {
	let player = (i + dealer + 1) % people;
	card = parseInt(newDeck.shift());
	data[name]['players'][player]['hand'].push(card);
	console.log('>> ' + name + ': Player ' + player + ' draws ' + cardType(card) + ' ' + cardColor(card));
}
```

The next card is set on top of the board to start playing. However, we avoid wild cards since a staring card, so in that case, we shuffle and draw another.

```javascript
let cardOnBoard;
do {
	cardOnBoard = parseInt(newDeck.shift());
	console.log('>> ' + name + ': Card on board ' + 					cardType(cardOnBoard) + ' ' + cardColor(cardOnBoard));
	if (cardColor(cardOnBoard) == 'black') {
		newDeck.push(cardOnBoard);
		console.log('>> ' + name + ': Replacing for another 				card');
	} else {
		break;
	}
} while (true);
data[name]['cardOnBoard'] = cardOnBoard;
```

Finally, it is established the whose turn is it and we track the reverse variable if the game is played clockwise or anti-clockwise.

```javascript
data[name]['turn'] = (dealer + 1) % people;
data[name]['reverse'] = 0;
```

Nevertheless, the card dealt on the table could change the initial state of the game. Such as a _Draw 2_, _Reverse_, or _Skip_ cards.

```javascript
if (cardType(cardOnBoard) == 'Draw2') {
	card = parseInt(newDeck.shift());
	data[name]['players'][(data[name]['turn'])]['hand'].push(card);
	console.log('>> ' + name + ': Player ' + (dealer + 1 % people) + ' draws ' + cardType(card) + ' ' + cardColor(card));
	card = parseInt(newDeck.shift());
	data[name]['players'][(data[name]['turn'])]['hand'].push(card);
	console.log('>> ' + name + ': Player ' + (dealer + 1 % people) + ' draws ' + cardType(card) + ' ' + cardColor(card));
	data[name]['turn'] = (dealer + 2) % people;
} else if (cardType(cardOnBoard) == 'Reverse') {
	data[name]['turn'] = Math.abs(dealer - 1) % people;
	data[name]['reverse'] = 1;
} else if (cardType(cardOnBoard) == 'Skip') {
  data[name]['turn'] = (dealer + 2) % people;
}
```

Once it is all calculated and prepared on the server-side, we send all the information to the players. Such as their hands, their turn and the card on the table.

```javascript
for (let i = 0; i < people; i++) {
	io.to(data[name]['players'][i]['id']).emit('haveCard', data[name]['players'][i]['hand']);
}
io.to(name).emit('turnPlayer', data[name]['players'][(data[name]['turn'])]['id']);
io.to(name).emit('sendCard', data[name]['cardOnBoard']);
```

On the client-side, these are the two events when triggered, one is to set the turn boolean variable and the other to print the cards on the player’s hand.

```javascript
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
```
---

## Handling players disconnection
Is a great idea to handle this issue if we want to improve the robustness a bit. So with these two functions on the server-side are aware if a disconnection is performed.

```javascript
  /**
   * Whenever someone is performing a disconnection,
   * leave its room and notify to the rest
   * @method
   */
  socket.on('disconnecting', function() {
    room = Object.keys(io.sockets.adapter.sids[socket.id])[1];
    if (room !== undefined) {
      clearInterval(data[room]['timeout']['id']);
      io.to(room).emit('playerDisconnect', room);
      console.log('>> ' + room + ': Player ' + socket.playerName + ' ('+
                  socket.id + ') leaves the room');
    }
  });

  /**
   * Whenever disconnection is completed
   * @method
   */
  socket.on('disconnect', function() {
    console.log('>> Player ' + socket.playerName + ' ('+
                socket.id + ') disconnected');
  });
```

Whenever anyone is disconnecting, we kick them from the room and notify the rest.

```javascript
socket.on('playerDisconnect', function() {
  console.log('<< Player disconnected in ' + room);
});
```

For now, is a little step of being able to down if anyone leaves in the middle of a game. But there’s more to do depending on how we want to proceed when it occurs. For example, we could finish the game tie, or allow to the rest keep playing anyways.

---
## Drawing or playing a card
### Coordinate system
_How we know which card wants to play or draw the user?_ After all, there is the only canvas. Once a card is printed on it, we lose track of it, because it becomes part of the whole painting.

The solution is by remembering the coordinates we left the card on the canvas, so if the player clicks in the area a card is printed, we could recover which card it is by the click coordinates.

The client-side has the following function which performs that calculation when the click event is triggered.

```javascript
function onMouseClick(e) {
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
```

The math operations I used are the result of tests that best fit the canvas. Is hard to explain in detail how I come with these but the important is that we can now say what card the player wants to play or draw.

### Drawing a card
In case they want to draw, the server will recover all the data of the room and if it is their corresponding turn will draw a card from the deck and give it to them. Then emits who is the next turn.

```javascript
socket.on('drawCard', function(res) {
	let numPlayer = data[res[1]]['turn'];
	let idPlayer = data[res[1]]['players'][numPlayer]['id'];
	let namePlayer = data[res[1]]['players']['name'];
	let handPlayer = data[res[1]]['players'][numPlayer]['hand'];
	let deck = data[res[1]]['deck'];

	if (idPlayer == socket.id) {
		let card = parseInt(deck.shift());
		handPlayer.push(card);
      io.to(idPlayer).emit('haveCard', handPlayer);
      //deck.push(card);
      // TODO: Check playable card
      //Next turn
      numPlayer = Math.abs(numPlayer + (-1) ** data[res[1]]['reverse']) % data[res[1]]['people'];
      data[res[1]]['turn'] = numPlayer;
      io.to(res[1]).emit('turnPlayer', data[res[1]]['players'][numPlayer]['id']);
    }
  });
```

### Playing a card
On the other hand, if they want to play a card from their hand, the server will check the rules to check if it is a legal move. 

```javascript
socket.on('playCard', function(res) {
    let numPlayer = data[res[1]]['turn'];
    let idPlayer = data[res[1]]['players'][numPlayer]['id'];
    let namePlayer = data[res[1]]['players']['name'];
    let handPlayer = data[res[1]]['players'][numPlayer]['hand'];
    let deck = data[res[1]]['deck'];

    if (idPlayer == socket.id) {
      let playedColor = cardColor(res[0]);
      let playedNumber = res[0] % 14;

      let boardColor = cardColor(data[res[1]]['cardOnBoard']);
      let boardNumber = data[res[1]]['cardOnBoard'] % 14;

      if (playedColor == 'black' || playedColor == boardColor || playedNumber == boardNumber) {
        // Play card
        io.to(res[1]).emit('sendCard', res[0]);
        data[res[1]]['cardOnBoard'] = res[0];
        // Remove card
        let cardPos = handPlayer.indexOf(res[0]);
        if (cardPos > -1) {
          handPlayer.splice(cardPos, 1);
        }
        io.to(idPlayer).emit('haveCard', handPlayer);

        // Next turn
        let skip = 0;
        if (cardType(res[0]) == 'Skip') {
          skip += 1;
        } else if (cardType(res[0]) == 'Reverse') {
          data[res[1]]['reverse'] = (data[res[1]]['reverse'] + 1) % 2;
        } else if (cardType(res[0]) == 'Draw2') {
          skip += 1;
          //draw2
        } else if (cardType(res[0]) == 'Draw4') {
          skip += 1;
          //draw4
        }
        numPlayer = Math.abs(numPlayer + (-1) ** data[res[1]]['reverse'] * (1 + skip)) % data[res[1]]['people'];
        data[res[1]]['turn'] = numPlayer;
        io.to(res[1]).emit('turnPlayer', data[res[1]]['players'][numPlayer]['id']);

      }
    }
  });
```

Once done, the server emits the remaining hand and the next player’s turn.

### Printing the results
Whenever we need to give cards to the players, we use this function to print several cards on their hand
```javascript
socket.on('haveCard', function(nums) {
  hand = nums;
  ctx.clearRect(0, 400, canvas.width, canvas.height);
  for (let i = 0; i < hand.length; i++) {
    ctx.drawImage(cards, 1+cdWidth*(hand[i]%14), 1+cdHeight*Math.floor(hand[i]/14), cdWidth, cdHeight, (hand.length/112)*(cdWidth/3)+(canvas.width/(2+(hand.length-1)))*(i+1)-(cdWidth/4), 400, cdWidth/2, cdHeight/2);
    console.log('<< Have card: ' + hand[i]);
  }
});
```

Or using this other one if we want to add just one 

```javascript
socket.on('sendCard', function(num) {
  ctx.drawImage(cards, 1+cdWidth*(num%14), 1+cdHeight*Math.floor(num/14), cdWidth, cdHeight, canvas.width/2-cdWidth/4, canvas.height/2-cdHeight/4, cdWidth/2, cdHeight/2);
});
```
