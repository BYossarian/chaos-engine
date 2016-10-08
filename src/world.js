
'use strict';

function World(grid, width, height, cellSize, wallHeight, skyBox, floor, wallTextures) {

    this.grid = grid;
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.wallHeight = wallHeight;

    this.skyBox = skyBox;
    this.floor = floor;
    this.wallTextures = wallTextures;

}

World.prototype.getCellAt = function(x, y) {

    var gridX = Math.floor(x / this.cellSize);
    var gridY = Math.floor(y / this.cellSize);

    return this.grid[gridX + gridY * this.width];

};

// given a ray, this will return the distance to the nearest wall
// NB: this assumes that the source is in an empty square
World.prototype.findRayWallIntersectionDistance = function(x, y, theta) {

    var cellSize = this.cellSize;

    // TODO: i think this can be seriously refactored! (and probably optimised)

    // so, we're going to find the vertical and horizontal grid lines that the ray 
    // intersections. we'll keep looping through these until we find a cell 
    // containing a wall:

    // indexes for the gridlines:
    // NB: these are not relative to the coordinate system, but rather are the 
    // ordinals for the lines that the ray crosses (i.e. 1st vertical that it 
    // crosses; 2nd horizontal etc.)
    var nthVertical = 0;
    var nthHorizontal = 0;

    // horizontalStep and verticalStep are the distances along lines parrallel to 
    // the given direction between vertical/horizontal gridlines
    // NB: JS can divide by 0 (returning Infinity) so don't need to worry about that
    var horizontalStep = cellSize / Math.sin(theta);
    var verticalStep = -cellSize / Math.cos(theta);  // need -ve because we're taking south to be positive

    var eastWestSign = Math.sign(horizontalStep);  // indicates if the ray is moving east (+ve) or west (-ve)
    var northSouthSign = Math.sign(verticalStep);  // indicates if the ray is moving up (-ve) or down (+ve)

    var distanceToNthVertical = horizontalStep * (eastWestSign > 0 ? (cellSize - x % cellSize) : x % cellSize) / cellSize;
    var distanceToNthHorizontal = verticalStep * (northSouthSign > 0 ? (cellSize - y % cellSize) : y % cellSize) / cellSize;

    var cellValue = 0;

    var walls = [];
    var texture = null;
    var previouslyTransparentTexture = null;

    // NB: this loop exits via a return once a wall is found; therefore this loop 
    // currently assumes that a wall will eventually be found
    while (true) {

        // TODO: distanceToNthHorizontal === distanceToNthVertical case?
        if (Math.abs(distanceToNthHorizontal) < Math.abs(distanceToNthVertical)) {

            nthHorizontal++;

            // check if the appropriate cell is full:
            // (the appropriate cell will depend on how many vertical/horiztonal 
            // gridlines we've crossed so far - we'll move the (x,y) point north/east/south/west
            // accordingly and check that cell for a wall)
            cellValue = this.getCellAt(x + (cellSize * nthVertical * eastWestSign), y + (cellSize * nthHorizontal * northSouthSign));
            if (cellValue) {
                texture = this.wallTextures[cellValue - 1];
                walls.push({    
                    d: Math.abs(distanceToNthHorizontal), 
                    w: northSouthSign < 0 ?
                        ((x + Math.sin(theta) * Math.abs(distanceToNthHorizontal)) % cellSize) / cellSize :
                        1 - (((x + Math.sin(theta) * Math.abs(distanceToNthHorizontal)) % cellSize) / cellSize),
                    t: texture
                });

                if (texture.semitransparent) {
                    distanceToNthHorizontal += verticalStep;
                    previouslyTransparentTexture = texture;
                } else {
                    return walls;
                }

            } else {
                if (previouslyTransparentTexture) {
                    walls.push({    
                        d: Math.abs(distanceToNthHorizontal), 
                        w: northSouthSign < 0 ?
                            ((x + Math.sin(theta) * Math.abs(distanceToNthHorizontal)) % cellSize) / cellSize :
                            1 - (((x + Math.sin(theta) * Math.abs(distanceToNthHorizontal)) % cellSize) / cellSize),
                        t: previouslyTransparentTexture
                    });
                    previouslyTransparentTexture = null;
                }
                distanceToNthHorizontal += verticalStep;
            }

        } else {
            
            nthVertical++;

            // check if the appropriate cell is full:
            // (the appropriate cell will depend on how many vertical/horiztonal 
            // gridlines we've crossed so far - we'll move the (x,y) point north/east/south/west
            // accordingly and check that cell for a wall)
            cellValue = this.getCellAt(x + (cellSize * nthVertical * eastWestSign), y + (cellSize * nthHorizontal * northSouthSign));
            if (cellValue) {
                texture = this.wallTextures[cellValue - 1];
                walls.push({
                    d: Math.abs(distanceToNthVertical), 
                    w: eastWestSign > 0 ?
                        ((y - Math.cos(theta) * Math.abs(distanceToNthVertical)) % cellSize) / cellSize :
                        1 - (((y - Math.cos(theta) * Math.abs(distanceToNthVertical)) % cellSize) / cellSize),
                    t: texture
                });

                if (texture.semitransparent) {
                    // if not, update distanceToNthVertical
                    distanceToNthVertical += horizontalStep;
                    previouslyTransparentTexture = texture;
                } else {
                    return walls;
                }

            } else {
                if (previouslyTransparentTexture) {
                    walls.push({
                        d: Math.abs(distanceToNthVertical), 
                        w: eastWestSign > 0 ?
                            ((y - Math.cos(theta) * Math.abs(distanceToNthVertical)) % cellSize) / cellSize :
                            1 - (((y - Math.cos(theta) * Math.abs(distanceToNthVertical)) % cellSize) / cellSize),
                        t: previouslyTransparentTexture
                    });
                    previouslyTransparentTexture = null;
                }
                // if not, update distanceToNthVertical
                distanceToNthVertical += horizontalStep;
            }

        }

    }

};

module.exports = World;
