
'use strict';

var TWO_PI = 2 * Math.PI;

// x, y, height and direction specify the position and direction of the camera 
// focalLength is in canvas pixels (i.e. same units as the canvas width/height)
// radius is the size/radius of the in-world object representing the camera
//      (used for wall collision detection)
// world is the World instance that the camera is viewing
// canvas is the canvas that this camera draws to
function Camera(x, y, height, direction, focalLength, radius, world, canvas) {
    
    this.x = x;
    this.y = y;
    this.height = height;
    this.direction = direction;

    this.focalLength = focalLength;

    this.radius = radius;

    this.world = world;

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

}

Camera.prototype.draw = function() {

    var ctx = this.ctx;
    var canvasWidth = this.canvas.width;
    var canvasHeight = this.canvas.height;
    var height = this.height;
    var rayDirection = 0;
    var wallDrawHeight = 0;
    var walls = null;
    var wall = null;
    var x = this.x;
    var y = this.y;
    var leftEdge = -Math.floor(canvasWidth / 2);
    var focalLength = this.focalLength;
    var direction = this.direction;
    var world = this.world;
    var wallTextures = world.wallTextures;
    var sky = world.skyBox;
    var texture = null;
    var wallsIndex = 0;
    var wallHeight = world.wallHeight;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // floor:
    ctx.fillStyle = 'rgb(29, 35, 14)';
    ctx.fillRect(0, canvasHeight/2, canvasWidth, canvasHeight/2);

    // skybox
    ctx.drawImage(sky.img, 0, 0, sky.width, sky.height, 0, 0, canvasWidth, canvasHeight/2);

    // TODO: allow adjustable camera height

    // TODO: pretty sure this can be massively optimised - given any two rays who both 
    // collide with the same wall, then any rays between them must also collide with 
    // that same wall. therefore, could scan even nth line first, see which walls they 
    // collide with, and then fill in any gaps between rays that collide with the same wall
    // rather than calling findRayWallIntersectionDistance all the time
    // Actually, by far the biggest cost turns out to be ctx.drawImage (at least in Chrome) 
    // accounting for around 80%+ of the time taken to draw each frame. Specfically, just 
    // commenting out that one line reduces the time that camera.draw() takes from somewhere 
    // between 7 and 16ms down to less than 1ms.
    // Not sure how to optimise this, other than reducing the number of calls to ctx.drawImage. 
    // So can either limit number of semi-transparent walls or reduce resolution.
    // Might always want to try https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform 
    // together with the above idea of finding whole sections of walls together rather than 
    // breaking it down into vertical lines? Then draw whole sections of the wall?
    // Ultimately, the 2d canvas context isn't really designed for efficient texture mapping.

    // loop through the horizontal lines of the view:
    for (var i = 0; i < canvasWidth; i++) {
        // NB: although the canvas/focalLength are in different units (i.e. canvas pixels) to the 
        // in-world units (e.g. wall height/distances), the scaling factor between the two actually 
        // cancels out from all calculations:
        rayDirection = Math.atan((leftEdge + i) / focalLength);
        walls = world.findRayWallIntersectionDistance(x, y, direction + rayDirection);
        wallsIndex = walls.length;
        // need to iterate backwards through walls:
        while (wallsIndex--) {
            wall = walls[wallsIndex];
            // this is the draw height in canvas pixel units:
            wallDrawHeight = (wallHeight * focalLength) / (wall.d * Math.cos(rayDirection));
            texture = wall.t;
            // distanceToWall.w belongs to the interval [0, 1], and the texture coords 
            // are 0-indexed so need to subtract one from the texture.width:
            ctx.drawImage(texture.img, Math.round((texture.width - 1) * wall.w), 0, 1, texture.height, i, (canvasHeight - wallDrawHeight) / 2, 1, wallDrawHeight);
        }
    }

};

// move camera by some amount in direction that it's pointing:
Camera.prototype.move = function(delta) {

    var xDelta = delta * Math.sin(this.direction);
    // -ve here because up (i.e. this.direction angle of 0) is -ve:
    var yDelta = -delta * Math.cos(this.direction);
    var newX = this.x + xDelta;
    var newY = this.y + yDelta;

    // TODO: right now this moves the camera in a piece-meal way, 
    // first horizontally, then vertically (kinda like a knight's
    // L shape in chess). this means it'll be able to make moves 
    // around corners that it otherwise wouldn't be able to make.
    // actually, maybe the inclusion of a camera radius solves 
    // this? need to think about it.

    if (!this.world.getCellAt(newX + (Math.sign(xDelta) * this.radius), this.y)) {
        this.x = newX;
    }

    if (!this.world.getCellAt(this.x, newY + (Math.sign(yDelta) * this.radius))) {
        this.y = newY;
    }

};

Camera.prototype.rotate = function(angleDelta) {

    this.direction += angleDelta;

    if (this.direction < 0) {
        this.direction += TWO_PI;
    }

    if (this.direction > TWO_PI) {
        this.direction -= TWO_PI;
    }

};

module.exports = Camera;
