var tic = require('tic')();

module.exports = Menu;

function Menu(options){
  var options = options || {};
  var self = this;

  this.window = options.window;
  this.message = options.message;
  this.choices = options.choices || [];
  this.game = options.game;
  this.close_timeout = options.close_timeout;
  this.opened = false;

  var okButton = document.getElementById("dialog-ok-button");
  var cancelButton = document.getElementById("dialog-cancel-button");

  okButton.addEventListener('click', function(event) {
    self.close();
    if (self.okCallback) {
      okCallback(self.choice);
    }
  });

  cancelButton.addEventListener('click', function(event) {
    self.close();
    if (self.cancelCallback) {
      cancelCallback(self.choice);
    }
  });
}

Menu.prototype.open = function(okCallback, cancelCallback) {
  var self = this;

  this.cancelCallback = cancelCallback;
  this.okCallback = okCallback;

  var elements = self.window.getElementsByClassName("message");
  console.log(self.window, elements)
  if (elements.length == 1) {
    elements[0].innerHTML = this.message;
  }
  var form = document.getElementById("choice-form");

  while (form.firstChild) {
    form.removeChild(form.firstChild);
  }
  this.choices.forEach(function(choice, index, array) {
    var p = document.createElement('p');
    var e = document.createElement('input');
    e.setAttribute('type', 'radio');
    e.setAttribute('name', 'choice');
    e.setAttribute('value', choice.name);

    e.addEventListener('change', function(event) {
      self.choice = e.getAttribute('value');
    });

    e.innerHTML = choice.value;
    var t = document.createTextNode(choice.value);
    p.appendChild(e);
    p.appendChild(t);
    form.appendChild(p);
  });

  /* We need to have the timer thread / window open the dialog
     so that it can be closed by the close timer */
  var openTimeout = this.game.addTimeout(function() {
    self.window.style.visibility = "visible";
  }, 1);

  var closeTimeout = this.game.addTimeout(function() {
    self.close();
  }, 1000 * this.close_timeout);
}

Menu.prototype.close = function() {
  var self = this;

  if (this.opened) {
    self.window.style.visibility = "hidden";

    this.opened = false;
  }
}
