
'use strict';

function Bitmap(src, width, height, semitransparent) {

    this.img = new Image();

    this.img.src = src;
    this.width = width;
    this.height = height;

    this.semitransparent = !!semitransparent;

}

module.exports = Bitmap;