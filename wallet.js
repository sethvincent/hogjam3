var inherits = require('inherits');

module.exports = Wallet;

function Wallet(game, options) {
  this.game = game;
  this.cash = 100;
  this.createHTML();
  this.meter = options.meter
}

Wallet.prototype.createHTML = function(){
  this.el = document.createElement('div');
  this.el.id = 'wallet';
  this.el.innerHTML = '$' + this.cash;

  document.body.appendChild(this.el);
};

Wallet.prototype.add = function(amount){
  this.cash += amount;
  this.draw();
  this.meter.add(amount);
}

Wallet.prototype.remove = function(amount){
  this.cash -= amount;
  this.draw();
  this.meter.remove(amount);
}

Wallet.prototype.changeEvent = function(type, amount) {
  if (type == "remove") {
    this.cash -= amount;
  } else if (type == "add") {
    this.cash += amount;
  }
  this.draw();
}

Wallet.prototype.draw = function() {
  this.el.innerHTML = '$' + this.cash;
}
