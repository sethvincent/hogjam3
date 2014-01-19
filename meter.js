var inherits = require('inherits');
var Entity = require('crtrdg-entity');

module.exports = Meter;

function Meter(options) {
  Entity.call(this);

  var self = this;

  this.level = 100;
  this.size = { y: 10 };

  if (options.hasOwnProperty("name")) {
    this.name = options.name;
  }
  if (options.hasOwnProperty("color")) {
    this.color = options.color;
  }
  if (options.hasOwnProperty("game")) {
    this.game = options.game;
  }
  if (options.hasOwnProperty("camera")) {
    this.camera = options.camera;
  }
  this.position = options.position;

  this.game.addIntervalEvent(this);

  this.everySecond = function() {
    if (this.level > 0) {
      this.level -= 1;
    }
    //console.log(this.name + " meter level: "+ this.level);
  };

  this.on('draw', function(c) {
    c.save();

    c.beginPath();
    c.lineWidth = 2;
    c.strokeStyle = "black";

    c.fillStyle = self.color;
    c.rect(
      self.position.x - self.camera.position.x,
      self.position.y - self.camera.position.y,
      102,
      self.size.y + 2
    );
    c.stroke();

    c.fillRect(
      self.position.x - self.camera.position.x + 1,
      self.position.y - self.camera.position.y + 1,
      self.level,
      self.size.y
    );
    c.restore();
  });
};

inherits(Meter, Entity);
