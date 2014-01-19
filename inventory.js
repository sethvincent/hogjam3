var inherits = require('inherits');

module.exports = Inventory;

function Inventory(game){
  this.game = game;
  this.game.inventory = {};

  this.defaultMaxWeight = 100;
  this.maxWeight = this.defaultMaxWeight;
  this.currentWeight = 0;

  this.createHTML();
}

Inventory.prototype.createHTML = function(){
  this.el = document.createElement('ul');
  this.el.id = 'inventory';

  var h3 = document.createElement('h3');
  h3.innerHTML = 'inventory';

  this.el.appendChild(h3);

  this.weightEl = document.createElement('span');
  this.weightEl.id = 'weight';
  this.weightEl.innerHTML = this.currentWeight + '/' + this.maxWeight;
  h3.appendChild(this.weightEl);

  document.body.appendChild(this.el);
};


Inventory.prototype.add = function(item){
  var self = this;
  var items = this.game.inventory;

  if (!items[item.id]){
    items[item.id] = {
      item: item,
      quantity: 1
    }

    this.addWeight(item.weight);

    var li = document.createElement('li');
    li.innerHTML = item.name;
    li.id = item.id;
    self.el.appendChild(li);

  } else {
    items[item.id].quantity += 1;
  }
};

Inventory.prototype.remove = function(item){
  var items = this.game.inventory;

  if (items[item.id]){
    if (items[item.id].quantity > 1){
        items[item.id].quantity -= 1;
    } else {
      delete items[item.id];
      var itemEl = document.getElementById(item.id);
      this.el.removeChild(itemEl);
    }
  }

  this.removeWeight(item.weight);
};

Inventory.prototype.list = function(){
  return this.game.inventory.join(', ');
};

Inventory.prototype.addWeight = function(weight){
  this.currentWeight += weight;
  this.weightEl.innerHTML = this.currentWeight + '/' + this.maxWeight;
}

Inventory.prototype.removeWeight = function(weight){
  this.currentWeight -= weight;
  this.weightEl.innerHTML = this.currentWeight + '/' + this.maxWeight;
}