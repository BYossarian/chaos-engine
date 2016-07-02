
'use strict';

// var KEY_BINDINGS = {
//     'ArrowLeft': 'rotateLeft',
//     'ArrowRight': 'rotateRight',
//     'ArrowUp': 'forward',
//     'ArrowDown': 'backwards',
//     'a': 'rotateLeft',
//     'd': 'rotateRight',
//     'w': 'forward',
//     's': 'backwards'
// };
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

var keyStates = {
    rotateLeft: false,
    rotateRight: false,
    forward: false,
    backwards: false
};
var canvas = document.querySelector('canvas');
var camera = null;
var world = null;
var lastLoopTime = 0;
var skyBox = new Bitmap('./dist/sky.png', 1, 80);
var wallTexture1 = new Bitmap('./dist/wall.png', 236, 243);
var wallTexture2 = new AnimatedBitmap(['./dist/a-wall-1.jpg', './dist/a-wall-2.jpg', './dist/a-wall-3.jpg'], 1000, 250, 250);
var glassTexture = new Bitmap('./dist/glass.png', 250, 250, true);

// TODO: there's logic in here (key bindings, movement etc.) that 
// belongs to the engine, so move it there.

// our coordinate system starts at the top-left, and 
// it's size is determined by the world's cellSize
var grid = [
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

function mainLoop(now) {

    // TODO - use this to de-couple the simulation time from the 
    // render rate:
    var timeDelta = now - lastLoopTime;

    lastLoopTime = now;

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
world = new World(grid, 20, 10, 10, 10, skyBox, 'rgb(29, 35, 14)', [ wallTexture1, wallTexture2, glassTexture ]);
camera = new Camera(15, 15, 5, Math.PI, RESOLUTION.WIDTH / 2, 1.5, world, canvas);

lastLoopTime = performance.now();
mainLoop();
