/*
* crtrdg.js modules
*/

var Game = require('crtrdg-gameloop');
var Keyboard = require('crtrdg-keyboard');
var Mouse = require('crtrdg-mouse');


/*
* custom modules
*/



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

/*
* Keyboard
*/

var keyboard = new Keyboard(game);


/*
* Mouse
*/

var mouse = new Mouse(game);

mouse.on('click', function(){
	if (game.paused) scene.set(match);
	else game.pause();
});