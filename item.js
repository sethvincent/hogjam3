var inherits = require('inherits');
var Entity = require('crtrdg-entity');

module.exports = Item;
inherits(Item, Entity);

function Item(options){
  this.name = options.name;
  this.game = options.game;
  this.weight = options.weight;
  this.id = this.name.replace(/ /g,'-').toLowerCase();

  this.position = {
    x: options.position.x,
    y: options.position.y
  };

  this.size = {
    x: options.size.x,
    y: options.size.y
  };

  this.color = '#fff111';
}

Item.prototype.use = function(){
  
}