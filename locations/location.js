var inherits = require('inherits');
var Entity = require('crtrdg-entity');

module.exports = Location;

function Location(options){
  Entity.call(this);
  var self = this;

  this.game = options.game;
  this.map = options.map;
  this.camera = options.camera;
  this.color = options.color;
  this.name = options.name;
  if (options.hasOwnProperty("spritesheet")) {
    this.spritesheet = options.spritesheet;
  }

  this.position = {
    x: options.position.x,
    y: options.position.y,
  };

  this.size = {
    x: options.size.x,
    y: options.size.y
  }

  this.hours = {
    open: options.hours.open,
    close: options.hours.close
  }

  this.sprite = new createjs.Sprite(this.spritesheet, this.name);

  this.uid = createjs.UID.get();

  this.on('update', function(interval){

  });

  this.on('draw', function(c){
    var x_pos = this.position.x - this.camera.position.x;
    var y_pos = this.position.y - this.camera.position.y;

    c.save();
    if (this.sprite) {
      //c.drawImage(this.bitmap, x_pos, y_pos);
      this.drawSprite(c, this.sprite, x_pos, y_pos);
      //                this.position.x - this.camera.position.x,
      //                this.position.y - this.camera.position.y);
    } else {
      c.fillStyle = this.color;
      c.fillRect(x_pos, y_pos,
                 this.size.x, this.size.y);
    }

    c.fillStyle = "white";
    c.font = "16px Arial";
    c.fillText(this.name, x_pos + 10, y_pos - 10);

    var status = this.open ? "open" : "closed";
    //console.log(status);

    c.fillStyle = "white";
    c.font = "12px Arial";
    c.fillText(status, x_pos + 30, y_pos + 85);

    c.restore();
  });

  this.drawSprite = function(c, sprite, x, y) {
    sprite._normalizeFrame();
    var o = sprite.spriteSheet.getFrame(sprite._currentFrame|0);
    if (!o) { return false; }
    var rect = o.rect;
    c.drawImage(o.image, rect.x, rect.y, rect.width, rect.height,
               x, y, rect.width, rect.height);
  };

  this.game.addMinuteListener(this);
}

inherits(Location, Entity);

Location.prototype.everyMinute = function(minute) {
  var hour = minute * 3;
  this.open = (hour >= this.hours.open) && (hour <= this.hours.close);
}
