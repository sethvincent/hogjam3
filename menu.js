var tic = require('tic')();

module.exports = Menu;

function Menu(options){
  var options = options || {};
  var self = this;

  this.window = options.window;
  this.message = options.message;
  this.choices = options.choices || [];
  this.game = options.game;
  if (options.hasOwnProperty("close_timeout")) {
    this.close_timeout = options.close_timeout;
  }
  if (options.hasOwnProperty("timer_message")) {
    this.timer_message = options.timer_message;
  }
  this.opened = false;
  this.modal = options.modal || false;
  this.name = options.name;
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

  this.close = function() {
    var self = this;

    if (this.opened) {
      self.window.style.visibility = "hidden";

      this.opened = false;
    }
    if (this.modal) {
      this.game.emit('unlock_movement');
    }

    if (self.choice) {
      var choice = this.choices[self.choice];
      this.game.emit("selected:" + this.name + ":" + self.choice);
    }
    document.getElementById("dialog-buttons").style.visibility = "hidden";
    document.getElementById("timer").style.visibility = "hidden";
  }


  this.open = function(okCallback, cancelCallback) {
    var self = this;
    this.timer = 0;
    this.cancelCallback = cancelCallback;
    this.okCallback = okCallback;
    this.choice = null;

    console.log("opening: " + this.name);

    var elements = self.window.getElementsByClassName("message");
    if (elements.length == 1) {
      elements[0].innerHTML = this.message;
    }
    var form = document.getElementById("choice-form");

    while (form.firstChild) {
      form.removeChild(form.firstChild);
    }
    for (var c in this.choices) {
      var choice = this.choices[c];
      var p = document.createElement('p');
      var e = document.createElement('input');
      e.setAttribute('type', 'radio');
      e.setAttribute('name', 'choice');
      e.setAttribute('value', choice.name);

      e.addEventListener('change', function(event) {
        self.choice = event.target.value;
        console.log("change event: " + self.choice);
      });

      e.innerHTML = choice.value;
      var t = document.createTextNode(choice.value);
      p.appendChild(e);
      p.appendChild(t);
      form.appendChild(p);
    };

    /* We need to have the timer thread / window open the dialog
       so that it can be closed by the close timer */
    var openTimeout = this.game.addTimeout(function() {
      self.window.style.visibility = "visible";
    }, 1);

    if (this.hasOwnProperty("close_timeout") && (this.close_timeout > 0)) {
      var timerInterval = window.setInterval(function(e) {
        self.timer += 1;
        if (self.timer_message) {
          var str = self.timer_message(self);
          document.getElementById("timer").style.visibility = "visible";
          document.getElementById("timer").innerHTML = str;
        }
      }, 1000);

      var closeTimeout = this.game.addTimeout(function(e) {
        self.close();
        clearInterval(timerInterval);
      }, 1000 * this.close_timeout);
    } else {
      document.getElementById("timer").style.visibility = "hidden";
    }

    if (this.modal) {
      this.game.emit('lock_movement');
      document.getElementById("dialog-buttons").style.visibility = "hidden";
      document.getElementById("timer").style.visibility = "hidden";
    } else {
      document.getElementById("dialog-buttons").style.visibility = "visible";
      document.getElementById("timer").style.visibility = "hidden";
    }
  }

}
