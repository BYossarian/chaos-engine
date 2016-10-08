
'use strict';

var KEY_BINDINGS = {
    // left arrow
    '37': 'rotateLeft',
    // right arrow
    '39': 'rotateRight',
    // up arrow
    '38': 'forward',
    // down arrow
    '40': 'backwards',
    // a
    '65': 'rotateLeft',
    // d
    '68': 'rotateRight',
    // w
    '87': 'forward',
    // s
    '83': 'backwards'
};
var RESOLUTION = {
    WIDTH: 640,
    HEIGHT: 360
};
var ROTATE_STEP = Math.PI/100;
var MOVE_STEP = 0.5;

var Bitmap = require('../src/bitmap.js');
var AnimatedBitmap = require('../src/animated.bitmap.js');
var World = require('../src/world.js');
var Camera = require('../src/camera.js');

var canvas = document.querySelector('canvas');
var camera = null;
var world = null;
var skyBox = new Bitmap('./img/sky.png', 1, 80);
var wallTexture1 = new Bitmap('./img/wall.png', 236, 243);
var wallTexture2 = new AnimatedBitmap(['./img/a-wall-1.jpg', './img/a-wall-2.jpg', './img/a-wall-3.jpg'], 1000, 250, 250);
var glassTexture = new Bitmap('./img/glass.png', 250, 250, true);

var lastLoopTime = 0;
var keyStates = {
    rotateLeft: false,
    rotateRight: false,
    forward: false,
    backwards: false
};

var TEXTURES = [ wallTexture1, wallTexture2, glassTexture ];
var FLOOR_COLOUR = 'rgb(29, 35, 14)';
// our coordinate system starts at the top-left, and 
// it's size is determined by the world's CELL_SIZE
var GRID = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 1, 1, 0, 3, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1,
    1, 1, 0, 2, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1,
    1, 1, 3, 1, 1, 0, 0, 3, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1,
    1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1,
    1, 1, 0, 1, 0, 1, 0, 3, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
    ];
var GRID_WIDTH = 20;
var GRID_HEIGHT = 10;
var CELL_SIZE = 10;
var WALL_HEIGHT = 10;

function mainLoop(now) {

    // TODO - use this to de-couple the simulation time from the 
    // render rate:
    var timeDelta = now - lastLoopTime;

    lastLoopTime = now;

    // TODO: decouple collision logic from camera
    if (keyStates.rotateLeft) {
        camera.rotate(-ROTATE_STEP);
    }

    if (keyStates.rotateRight) {
        camera.rotate(ROTATE_STEP);
    }

    if (keyStates.forward && !keyStates.backwards) {
        camera.move(MOVE_STEP);
    }

    if (keyStates.backwards && !keyStates.forward) {
        camera.move(-MOVE_STEP);
    }

    camera.draw();

    requestAnimationFrame(mainLoop);

}

document.body.addEventListener('keydown', function(e) {
    var key = e.which || e.keyCode;
    keyStates[KEY_BINDINGS[key]] = true;
}, false);

document.body.addEventListener('keyup', function(e) {
    var key = e.which || e.keyCode;
    keyStates[KEY_BINDINGS[key]] = false;
}, false);

canvas.width = RESOLUTION.WIDTH;
canvas.height = RESOLUTION.HEIGHT;
world = new World(GRID, GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, WALL_HEIGHT, skyBox, FLOOR_COLOUR, TEXTURES);
camera = new Camera(15, 15, Math.PI, RESOLUTION.WIDTH / 2, 1.5, world, canvas);

lastLoopTime = performance.now();
mainLoop();
