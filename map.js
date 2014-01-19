var randomRGBA = require('./util/math').randomRGBA;
var locations = require('./locations.json');
var Location = require('./locations/location');
var AssetLoader = require('./asset_loader');

module.exports = Map;

function Map(game, width, height){
  this.game = game;
  this.width = width;
  this.height = height;
  this.image = null;
}

Map.prototype.generate = function(ticks){
  var context = document.createElement('canvas').getContext('2d');

  context.canvas.width = this.width;
  context.canvas.height = this.height;

  var size = 30;
  var columns = this.width / size;
  var rows = this.height / size;

  /*
  for (var x = 0, i = 0; i < columns; x+=size, i++){
    for (var y = 0, j=0; j < rows; y+=size, j++){
      context.fillStyle = randomRGBA(0, 255, 0, 255, 0, 255, 1);
      context.fillRect(x, y, size, size);
    }
  }
  */

  this.image = new Image();
  this.image.src = context.canvas.toDataURL("image/png");

  context = null;
}

// draw the map adjusted to camera
Map.prototype.draw = function(context, camera) {
  context.drawImage(this.image, 0, 0, this.image.width, this.image.height, -camera.position.x, -camera.position.y, this.image.width, this.image.height);
}

Map.prototype.load = function(game, camera, spritesheet, filename) {
  var map = this;

  var data = {
    images: [ "assets/setPiecesTSR.PNG" ],
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

  this.assetLoader = new AssetLoader();
  this.spritesheet = this.assetLoader.load(data);

  map.locations = [];
  map.spritesheet = spritesheet;

  var assetLoader = new AssetLoader();
  var data = {
    images: [ "assets/setPiecesTSR.PNG" ],
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

  spritesheet = assetLoader.load("assets/setPiecesTSR.PNG", data);

  locations.forEach(function(location, index, array) {
    location.game = game;
    location.camera = camera;
    location.map = map;
    location.spritesheet = map.spritesheet;

    var building = new Location(location);
    building.addTo(game);
    map.locations.push(building);
  });

}
