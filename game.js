/*
* crtrdg.js modules
*/

var Game = require('crtrdg-gameloop');
var Keyboard = require('crtrdg-keyboard');
var Mouse = require('crtrdg-mouse');


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

})

game.on('draw', function(c){

});

game.on('draw-background', function(context){
  context.fillStyle = 'rgb(100, 200, 150)';
  context.fillRect(0, 0, game.width, game.height);
  map.draw(context, camera);
});

game.on('draw-foreground', function(context){

});


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