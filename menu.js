var tic = require('tic')();

module.exports = Menu;
//inherits(, EventEmitter);

function Menu(options){
  var options = options || {};
  var self = this;

  this.window = options.window;
  this.message = options.message;
  this.choices = options.choices;
  this.game = options.game;
  this.close_timeout = options.close_timeout;
  this.opened = false;
}

Menu.prototype.open = function() {
  var self = this;
  if (!this.opened) {
    this.opened = true;
    /* We need to have the timer thread / window open the dialog
       so that it can be closed by the close timer */
    var openTimeout = this.game.addTimeout(function() {
      self.window.style.visibility = "visible";
    }, 1);

    var closeTimeout = this.game.addTimeout(function() {
      self.close();
    }, 1000 * this.close_timeout);
  //this.game.addIntervalEvent(this);

  }
}

Menu.prototype.close = function() {
  var self = this;

  if (this.opened) {
    self.window.style.visibility = "hidden";

    this.opened = false;
  }
}
