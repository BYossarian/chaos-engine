
'use strict';

function AnimatedBitmap(srcs, frameDuration, width, height, semitransparent) {

    this.start = performance.now();
    this.frameDuration = frameDuration;
    this.frames = srcs.length;

    this.imgs = srcs.map(function(src) {
        var img = new Image();
        img.src = src;
        return img;
    });

    this.width = width;
    this.height = height;

    this.semitransparent = !!semitransparent;

}

// use getter so that AnimatedBitmaps have the same interface as regular Bitmaps
Object.defineProperty(AnimatedBitmap.prototype, 'img', {
    get: function() {
        var frameNumber = Math.floor((performance.now() - this.start) / this.frameDuration) % this.frames;
        return this.imgs[frameNumber];
    }
});

module.exports = AnimatedBitmap;