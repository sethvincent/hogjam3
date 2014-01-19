var inherits = require('inherits');
var Entity = require('crtrdg-entity');
var randomInt = require('./util/math').randomInt;
var randomRGB = require('./util/math').randomRGB;
var randomRGBA = require('./util/math').randomRGBA;
var AssetLoader = require('./asset_loader');

module.exports = Player;

function Player(options){
  Entity.call(this);
  var self = this;

  this.game = options.game;
  this.keysDown = options.keysDown;
  this.camera = options.camera;

  this.size = { x: 16, y: 16 };
  this.velocity = { x: 0, y: 0 };
  this.position = options.position;

  this.speed = 8;
  this.friction = 0.4;
  this.health = 100;
  this.strength = 5;
  this.color = '#fff';
  this.visible = true;
  this.points = 00;
  this.blockers = {};
  this.step = 0;

  this.particles = {
    jump: {
      size: 3,
      number: 10,
      color: '#b4b4ad'
    }
  }

  var assetData = {
    images: [ "assets/basictiles.png" ],
    frames: [
      [0,   160, 16, 16, 0],
      [16,  160, 16, 16, 0],
      [32,  160, 16, 16, 0],
      [48,  160, 16, 16, 0],
      [64,  160, 16, 16, 0],
      [80,  160, 16, 16, 0],
      [96,  160, 16, 16, 0],
      [112, 160, 16, 16, 0],
    ],
    animations: {
      down: [0, 1],
      right: [2, 3],
      up: [4, 5],
      left: [6, 7]
    }
  };
  this.assetLoader = new AssetLoader();
  var spriteSheet = this.assetLoader.load("assets/setPiecesTSR.PNG", assetData);

  this.anims = {
    "up": new createjs.Sprite(spriteSheet, "up"),
    "down": new createjs.Sprite(spriteSheet, "down"),
    "right": new createjs.Sprite(spriteSheet, "right"),
    "left": new createjs.Sprite(spriteSheet, "left")
  }

  this.on('update', function(interval){
    self.input(self.keysDown);
    self.handleBlockers();
    self.move();
    self.velocity.x *= this.friction;
    self.velocity.y *= this.friction;
    self.boundaries();
  });

  this.on('draw', function(c){
    c.save();
    c.fillStyle = self.color;

    var x_pos = self.position.x - this.camera.position.x;
    var y_pos = self.position.y - this.camera.position.y;

    //c.fillRect(x_pos, y_pos, self.size.x, self.size.y);

    var frame = (this.step >= 20) ? 0 : 1;
    if (this.direction && (this.direction.length > 0)) {
      this.assetLoader.drawSprite(c, this.anims[this.direction],
                                  x_pos, y_pos, frame);
    } else {
      this.assetLoader.drawSprite(c, this.anims["down"],
                                  x_pos, y_pos);
    }

    c.restore();
  });
}

inherits(Player, Entity);

Player.prototype.move = function(){
  this.position.x += this.velocity.x * this.friction;
  this.position.y += this.velocity.y * this.friction;

  if (this.direction && (this.direction.length > 0)) {
    var anim = this.anims[this.direction];
    anim.x = this.position.x;
    anim.y = this.position.y;
  }

  if (this.step == 40) {
    this.step = 0;
  }
};

Player.prototype.handleBlockers = function() {
  for (var blocker in this.blockers) {
    if (this.blockers[blocker]) {
      var b = this.blockers[blocker];
      var x_overlap, y_overlap;

      // TODO: more intelligently do this based on center of objects
      if (this.position.x <= (b.position.x + b.size.x) &&
          (((b.position.x + b.size.x) - this.position.x) < this.size.x)) {
        x_overlap = this.position.x - (b.position.x + b.size.x);
        this.position.x -= x_overlap - 1;
        if (this.velocity.x < 0) {
          this.velocity.x = 0;
        }
      } else if ((this.position.x + this.size.y) >= b.position.x) {
        x_overlap = (this.position.x + this.size.x) - b.position.x;
        this.position.x -= x_overlap + 2;
        if (this.velocity.x < 0) {
          this.velocity.x = 0;
        }
      }
    }
  };
};

Player.prototype.addBlocker = function(blocker) {
  this.blockers[blocker.uid] = blocker;
}

Player.prototype.removeBlocker = function(blocker) {
  this.blockers[blocker.uid] = false;
}

Player.prototype.boundaries = function(){
  if (this.position.x <= 0){
    this.position.x = 0;
  }

  if (this.position.x >= this.camera.map.width - this.size.x){
    this.position.x = this.camera.map.width - this.size.x;
  }

  if (this.position.y <= 0){
    this.position.y = 0;
  }

  if (this.position.y >= this.camera.map.height - this.size.y){
    this.position.y = this.camera.map.height - this.size.y;
  }
};

Player.prototype.input = function(){
  if ('W' in this.keysDown){
    this.velocity.y -= this.speed;
    this.direction = "up";
    this.step += 1;
  }

  if ('S' in this.keysDown){
    this.velocity.y += this.speed;
    this.direction = "down";
    this.step += 1;
  }

  if ('A' in this.keysDown){
    this.velocity.x -= this.speed;
    this.direction = "left";
    this.step += 1;
  }

  if ('D' in this.keysDown){
    this.velocity.x += this.speed;
    this.direction = "right";
    this.step += 1;
  }
};
