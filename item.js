var inherits = require('inherits');
var Entity = require('crtrdg-entity');

module.exports = Item;
inherits(Item, Entity);

function Item(options){
  this.name = options.name;
  this.game = options.game;
  this.weight = options.weight;
  this.id = this.name.replace(/ /g,'-').toLowerCase();
  this.healthMeter = options.healthMeter || {};

  this.position = {
    x: options.position.x,
    y: options.position.y
  };

  this.size = {
    x: options.size.x,
    y: options.size.y
  };

  this.color = '#fff111';
  this.healing = options.healing;
}

Item.prototype.eat = function(){
  this.healthMeter.level += this.healing;
  if (this.healthMeter.level += 100) this.healthMeter.level = 100;
}