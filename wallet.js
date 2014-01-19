var inherits = require('inherits');

module.exports = Wallet;

function Wallet(game){
  this.game = game;
  this.cash = 0;
  this.createHTML();
}

Wallet.prototype.createHTML = function(){
  this.el = document.createElement('div');
  this.el.id = 'wallet';
  this.el.innerHTML = '$' + this.cash;

  document.body.appendChild(this.el);
};

Wallet.prototype.add = function(amount){
	this.cash += amount;
	this.el.innerHTML = '$' + this.cash;
}

Wallet.prototype.remove = function(amount){
	this.cash -= amount;
	this.el.innerHTML = '$' + this.cash;
}

