//var inherits = require('inherits');

module.exports = AssetLoader;
//inherits(Location, Entity);

function AssetLoader(options) {
  var self = this;
}

AssetLoader.prototype.load = function(filename) {
  var data = {
    images: [ filename ],
    frames: [
      [3, 170, 81, 64, 0],
      [86, 170, 81, 64, 0],
      [168, 170, 81, 64, 0],
      [250, 170, 81, 64, 0],
      [250, 170, 81, 64, 0]
    ],
    animations: {
      Shop: 0,
      Shelter: 1,
      "Food Bank": 2,
      Office: 3,
      Jail: 4
    }
  };
  var spriteSheet = new createjs.SpriteSheet(data);
  return spriteSheet;
};
