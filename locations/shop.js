var inherits = require('inherits');
var Entity = require('crtrdg-entity');

module.exports = Shop;
inherits(Shop, Entity)

function Shop(options){
	Entity.call(this);
  var self = this;

  this.game = options.game;
  this.map = options.map;
  this.camera = options.camera;

  this.position = {
    x: options.position.x,
    y: options.position.y,
  };

  this.size = {
  	x: options.size.x,
  	y: options.size.y
  }

  this.on('update', function(interval){ 

  });

  this.on('draw', function(c){
    c.save();
    c.fillStyle = '#ffffff';
    c.fillRect(this.position.x - this.camera.position.x, this.position.y - this.camera.position.y, this.size.x, this.size.y);
    c.restore();
  });
}