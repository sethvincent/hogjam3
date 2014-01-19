var inherits = require('inherits');
var Entity = require('crtrdg-entity');
var Location = require('./location');

module.exports = Office;
inherits(Office, Location);

function Office(options){
  Location.call(this, options);
  var self = this;

  this.game = options.game;
  this.map = options.map;
  this.camera = options.camera;
  this.color = 'blue';

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
