//var inherits = require('inherits');

module.exports = AssetLoader;
//inherits(Location, Entity);

function AssetLoader(options) {
  var self = this;
}

AssetLoader.prototype.load = function(data) {
  var spriteSheet = new createjs.SpriteSheet(data);
  return spriteSheet;
};

AssetLoader.prototype.drawSprite = function(c, sprite, x, y, frame) {
  sprite._normalizeFrame();
  if (!frame) {
    frame = 0;
  }
  var o = sprite.spriteSheet.getFrame(sprite._currentFrame | frame);
  if (!o) { return false; }
  var rect = o.rect;
  c.drawImage(o.image, rect.x, rect.y, rect.width, rect.height,
              x, y, rect.width, rect.height);
};
