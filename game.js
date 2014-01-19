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
var randomInt = require('./util/math').randomInt;
var randomRGB = require('./util/math').randomRGB;
var randomRGBA = require('./util/math').randomRGBA;


/*
* create game object
*/

var game = new Game({
  canvas: 'game',
  width: window.innerWidth,
  height: window.innerHeight,
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

/* every minute */

var minutes = 0;
tick.interval(function() {
  console.log('minutes', minutes);

  if(minutes === 0) scene.set(day);
  if(minutes === 5) scene.set(night);

  if (minutes == 8) minutes = 0;
  else minutes++;

  player.everyMinute();
}, 60000);


/* every second */

var seconds = 0;
tick.interval(function() {
  console.log('seconds', seconds)
  if (seconds == 60) seconds = 0;
  else seconds++;

  player.everySecond();
}, 1000);


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

player.everySecond = function(){
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
