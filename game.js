var tick = require('tic')();

/*
* crtrdg.js modules
*/

var Game = require('crtrdg-gameloop');
var Keyboard = require('crtrdg-keyboard');
var Mouse = require('crtrdg-mouse');
var SceneManager = require('crtrdg-scene');

/*
* custom modules
*/

var Map = require('./map');
var Camera = require('./camera');
var Player = require('./player');
var Item = require('./item');
var Inventory = require('./inventory');

/* locations */
var Shop = require('./locations/shop');

/* util */
var randomInt = require('./util/math').randomInt;
var randomRGB = require('./util/math').randomRGB;
var randomRGBA = require('./util/math').randomRGBA;

var Meter = require('./meter');

/*
* create game object
*/

var game = new Game({
  canvas: 'game',
  width: window.innerWidth,
  height: window.innerHeight - 100,
  backgroundColor: randomRGBA(122, 256, 22, 256, 0, 256, 0.4)
});

game.on('pause', function(){
	console.log('paused');
});

game.on('resume', function(){
	console.log('resumed');
});

game.on('update', function(interval){
	tick.tick(interval);
});

game.on('draw', function(c){

});

game.on('draw-background', function(context){
  context.fillStyle = 'rgb(100, 200, 150)';
  context.fillRect(0, 0, game.width, game.height);
  map.draw(context, camera);
  game.currentScene.emit('draw-background', context);
});

game.on('draw-foreground', function(context){
	game.currentScene.emit('draw-foreground', context);
});


/*
* Counter stuff
*/

// Global list of counter listeners
intervalEvents = [];

/* every minute */

var minutes = 0;
tick.interval(function() {
  if(minutes === 0) scene.set(day);
  if(minutes === 5) scene.set(night);

  player.everyMinute(minutes);


  if (minutes == 8) minutes = 0;
  else minutes++;

}, 60000);


/* every second */
var seconds = 0;
tick.interval(function() {

  player.everySecond(seconds);

  if (seconds == 60) seconds = 0;
  else seconds++;

  intervalEvents.forEach(function(listener, index, array) {
    listener.everySecond();
  });

}, 1000);

game.addIntervalEvent = function(listener) {
  intervalEvents.push(listener);
};


/*
* Keyboard
*/

var keyboard = new Keyboard(game);
var keysDown = keyboard.keysDown;


/*
* Mouse
*/

var mouse = new Mouse(game);

mouse.on('click', function(){

});


/*
* Player
*/

var player = new Player({
  game: game,
  keysDown: keysDown,
  camera: camera,
  position: { x: game.width / 2 - 10, y: game.height / 2 - 10 }
});

player.addTo(game);

player.everySecond = function() {
  if(game.currentScene.name == 'day'){

  }

  if(game.currentScene.name == 'night'){

  }
}

player.everyMinute = function(){
	if(game.currentScene.name == 'day'){

  }

  if(game.currentScene.name == 'night'){

  }
}


/*
*
* MAP & CAMERA
*
*/

var map = new Map(game, 5000, 5000);
map.generate();

var camera = new Camera({
  game: game,
  follow: player,
  followPoint: { x: game.width / 2, y: game.height / 2 },
  viewport: { width: game.width, height: game.height },
  map: map
});


/*
* Scenes
*/

var scene = new SceneManager(game);


/*
* Day
*/

var day = scene.create({
	name: 'day'
});

/* start with day scene */
scene.set(day);

day.on('start', function(){
	console.log('day is starting');
});

day.on('update', function(interval){

});

day.on('draw', function(context){

});

day.on('draw-background', function(c){

});

day.on('draw-foreground', function(c){
  c.fillStyle = 'rgba(255, 255, 255, 0.2)';
  c.fillRect(0, 0, game.width, game.height);
});


/*
* Night
*/

var night = scene.create({
	name: 'night'
});

night.on('start', function(){
	console.log('night is starting')
});

night.on('update', function(interval){

});

night.on('draw', function(c){

});

night.on('draw-background', function(c){

});

night.on('draw-foreground', function(c){
  c.fillStyle = 'rgba(0, 0, 0, 0.5)';
  c.fillRect(0, 0, game.width, game.height);
});


/*
* Locations
*/

var shop = new Shop({
	camera: camera,
	map: map,
	position: {
		x: 200,
		y: 200
	},
	size: {
		x: 100,
		y: 300
	}
});

shop.addTo(game);

//addIntervalEvent(player.everySecond);

var healthMeter = new Meter({
  game: game,
  camera: camera,
  name: "health",
  color: "red",
  position: { x: 10, y: 10 }
});
healthMeter.addTo(game);

var energyMeter = new Meter({
  game: game,
  camera: camera,
  name: "energy",
  color: "blue",
  position: { x: 10, y: 30 }
});
energyMeter.addTo(game);

var moneyMeter = new Meter({
  game: game,
  camera: camera,
  name: "money",
  color: "green",
  position: { x: 10, y: 50 }
});
moneyMeter.addTo(game);


/*
*
* INVENTORY & ITEMS
*
*/

var inventory = new Inventory(game);

var pizza = new Item({
  name: 'pizza',
  position: { x: 500, y: 140 },
  size: { x: 20, y: 20 },
  weight: 5
});

pizza.addTo(game);

pizza.on('update', function(){
	if (player.touches(pizza)){
		console.log('ooooh, picked up pizza.');
		pizza.remove();
    inventory.add(pizza);
	}
});

pizza.on('draw', function(c){
	c.fillStyle = '#ff0000';
	c.fillRect(
		this.position.x - camera.position.x,
		this.position.y - camera.position.y,
		this.size.x,
		this.size.y
	);
});