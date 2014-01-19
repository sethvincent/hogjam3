var inherits = require('inherits');
var Entity = require('crtrdg-entity');
var Location = require('./location');

module.exports = Shop;
inherits(Shop, Location);

function Shop(options){
  Location.call(this, options);
  var self = this;

  this.game = options.game;
  this.map = options.map;
  this.camera = options.camera;
  this.color = '#ffffff';

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

}
