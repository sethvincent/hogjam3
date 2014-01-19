var inherits = require('inherits');
var Entity = require('crtrdg-entity');

module.exports = Location;
inherits(Location, Entity);

function Location(options){
  Entity.call(this);
  var self = this;

  console.log(options);

  this.game = options.game;
  this.map = options.map;
  this.camera = options.camera;
  this.color = options.color;
  this.name = options.name;

  this.position = {
    x: options.position.x,
    y: options.position.y,
  };

  this.size = {
    x: options.size.x,
    y: options.size.y
  }

  this.hours = {
    x: options.hours.open,
    y: options.hours.close
  }

  this.on('update', function(interval){

  });

  this.on('draw', function(c){
    c.save();
    c.fillStyle = this.color;
    c.fillRect(this.position.x - this.camera.position.x,
               this.position.y - this.camera.position.y,
               this.size.x, this.size.y);
    c.restore();
  });

}

//Location.prototype.hours
