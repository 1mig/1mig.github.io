/**
 * TileConstraints
 *  tileMap
 *  walkable
 *  wall
 *  either walkable or wall
 * */

/**
 *
 * */

function generateNoise(width, height, density = .8) {
    // Iterate from Top-Left to Bottom-Right
    let noise = [];


    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (noise[x] == null) noise[x] = [];
            if (noise[x][y] == null) noise[x][y] = [];
            // noise[x][y] = Math.round(Math.random());
            noise[x][y][0] = (density === -1) ? Math.round(Math.random()) : randomDensityBinary(1, density);
        }
    }


    /* Miscellaneous */
    noise['width'] = width;
    noise['height'] = height;

    noise['camera'] = {};

    // Object.defineProperty(noise.camera, 'x', {
    //     set: function (val) {this._x = (isNaN(val)) ? (this._x ?? 0) : Math.min(Math.max(val, 0), noise.width-1);},
    //     get: function () {return this._x;}
    // });
    // Object.defineProperty(noise.camera, 'y', {
    //     set: function (val) {this._y = (isNaN(val)) ? (this._y ?? 0) : Math.min(Math.max(val, 0), noise.height-1);},
    //     get: function () {return this._y;}
    // });

    noise['camera']['save'] = function () {
        if (noise.camera.x == null) return;
        noise['camera']['savedX'] = noise.camera.x;
        noise['camera']['savedY'] = noise.camera.y;
    };
    noise['camera']['restore'] = function () {
        if (noise['camera']['savedX'] == null) return;
        noise.camera.x = noise['camera']['savedX'];
        noise.camera.y = noise['camera']['savedY'];
    };

    noise['camera']['toString'] = function () {
        console.log(noise.camera.x, noise.camera.y, noise.camera.chaseX, noise.camera.chaseY);
    }

    noise['draw'] = function (x, y) {
        // if ((x < 0 || x >= width) || (y < 0 || y >= height) || isNaN(x) || isNaN(y)) return false;
        if (noise.context === undefined) return false;

        // noise.context.fillStyle =  ((cv > 0) ? '#ffffff' : '#111111');
        // noise.context.fillRect((cx*noise.tileSize[0]), (cy*noise.tileSize[1]), noise.tileSize[0], noise.tileSize[1]);

        let obj = noise.getObject(x, y);
        // console.log(obj);

        if (obj !== null && obj !== undefined) {
            // console.log(obj);
            this.context.imageSmoothingEnabled = false;
            noise.context.clearRect((x*noise.tileSize[0]), (y*noise.tileSize[1]), noise.tileSize[0], noise.tileSize[1]);
            noise.context.drawImage(noise.tileMapImage, obj.x * noise.tileMap.tileSize.width, obj.y * noise.tileMap.tileSize.height, noise.tileMap.tileSize.width, noise.tileMap.tileSize.height, x*noise.tileSize[0], y*noise.tileSize[1], noise.tileSize[0], noise.tileSize[1])

        }else {

            // noise.context.fillStyle =  '#111';
            // noise.context.fillRect((x*noise.tileSize[0]), (y*noise.tileSize[1]), noise.tileSize[0], noise.tileSize[1]);
            noise.context.clearRect((x*noise.tileSize[0]), (y*noise.tileSize[1]), noise.tileSize[0], noise.tileSize[1]);

        }

        // this.context.drawImage(this.image, this.translateX, this.translateY, this.translateWidth == 0 ? this.width : this.translateWidth, this.translateHeight == 0 ? this.height : this.translateWidth, this.x, this.y, this.width, this.height);

        // map.context.fillRect((cx*map.tileSize[0]), (cy*map.tileSize[1]), map.tileSize[0], map.tileSize[1]);


        return true;
    }

    noise['getObject'] = function (x, y) {
        if ((x < 0 || x >= width) || (y < 0 || y >= height) || isNaN(x) || isNaN(y)) return 0;
        return noise[x][y][1];
    }

    noise['setObject'] = function (x, y, v) {
        if ((x < 0 || x >= width) || (y < 0 || y >= height)) return false;
        noise[x][y][1] = v;
        return true;
    }

    noise['get'] = function (x, y) {
        if ((x < 0 || x >= width) || (y < 0 || y >= height) || isNaN(x) || isNaN(y)) return 0;
        return noise[x][y][0];
    }

    noise['set'] = function (x, y, v) {
        if ((x < 0 || x >= width) || (y < 0 || y >= height)) return false;
        noise[x][y][0] = v;
        return true;
    }

    return noise;
}

function erosion_dilate(is_erosion = 0) {
    let skipped = [];
    let nb = 0;
    let tmp_val = 0;

    // Get Each Hit and save to Skipped for later use.
    // why not just combine both of the line?
    // if we merge the code, it will result to almost blank, because isFit will never trigger
    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {

            nb = getNeighbors(map, x, y);
            if (map.get(x, y) === is_erosion) {
                if (isFit(nb)) {}
                else if (isHit(nb)) {
                    tmp_val = xyToSingle(map.width, x, y);
                    if (!skipped.includes(tmp_val))
                        skipped.push(tmp_val);
                }else {
                    map.set(x, y, 0);
                }
            }

        }
    }
    for (const skippedElement of skipped) {
        tmp_val = singleToXY(map.width, skippedElement);
        map.set(tmp_val.x, tmp_val.y, (is_erosion ^ 1));
    }
}

function dilate(map) {erosion_dilate();}

function erosion(map) {erosion_dilate(1);}

function cellularAutomata(map, inverse = 1) {
    let wall = 0;
    let active = 0;
    let reverse = 0;
    let changed = false;
    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
            active = map.get(x, y);
            active = (active > 0) ? 1 : 0; // min-max
            wall = active^1;
            wall += countWall(map, x, y);
            reverse = (wall > 4) ? (inverse^1) : inverse;
            if (active !== reverse) {
                map.set(x, y, reverse);
                changed = true;
            }
        }
    }
    return changed;
}

function getNeighbors(map, x, y) {
    return (
        map.get(x-1, y-1) << 21  | // top-left
        map.get(x, y-1) << 18    | // top
        map.get(x+1, y-1) << 15  | // top-right

        map.get(x-1, y) << 12  | // mid-left
        map.get(x+1, y) << 9   | // mid-right

        map.get(x-1, y+1) << 6   | // bot-left
        map.get(x, y+1) << 3     | // bot
        map.get(x+1, y+1)          // bot-right
    );
}

function getNeighborsHasValue(map, x, y, has_value, should_value=1, fail_value=0) {
    return (
        ((map.get(x-1, y-1) === has_value) ? should_value : fail_value) << 21  | // top-left
        ((map.get(x, y-1) === has_value) ? should_value : fail_value)  << 18    | // top
        ((map.get(x+1, y-1) === has_value) ? should_value : fail_value)    << 15  | // top-right

        ((map.get(x-1, y) === has_value) ? should_value : fail_value)    << 12  | // mid-left
        ((map.get(x+1, y) === has_value) ? should_value : fail_value)    << 9   | // mid-right

        ((map.get(x-1, y+1) === has_value) ? should_value : fail_value)   << 6   | // bot-left
        ((map.get(x, y+1) === has_value) ? should_value : fail_value)    << 3     | // bot
        ((map.get(x+1, y+1) === has_value) ? should_value : fail_value)             // bot-right
    );
}

function singleNeighborHasValue(neighbor, has_value, should_value=1, fail_value=0) {
    return (
        ((((neighbor>>21) & (0b111)) === has_value) ? should_value : fail_value) << 21  | // top-left
        ((((neighbor>>18) & (0b111)) === has_value) ? should_value : fail_value) << 18    | // top
        ((((neighbor>>15) & (0b111)) === has_value) ? should_value : fail_value) << 15  | // top-right

        ((((neighbor>>12) & (0b111)) === has_value) ? should_value : fail_value) << 12  | // mid-left
        ((((neighbor>>9) & (0b111)) === has_value) ? should_value : fail_value) << 9   | // mid-right

        ((((neighbor>>6) & (0b111)) === has_value) ? should_value : fail_value) << 6   | // bot-left
        ((((neighbor>>3) & (0b111)) === has_value) ? should_value : fail_value) << 3     | // bot
        ((((neighbor) & (0b111)) === has_value) ? should_value : fail_value)             // bot-right
    );
}

function countWall(map, x, y) {
    return (
        (map.get(x-1, y-1) === 0 ? 1 : 0) +
        (map.get(x, y-1)   === 0 ? 1 : 0) +
        (map.get(x+1, y-1) === 0 ? 1 : 0) +

        (map.get(x-1, y) === 0 ? 1 : 0) +
        (map.get(x+1, y) === 0 ? 1 : 0) +

        (map.get(x-1, y+1) === 0 ? 1 : 0) +
        (map.get(x, y+1)   === 0 ? 1 : 0) +
        (map.get(x+1, y+1)   === 0 ? 1 : 0)
    );
}

function xyToSingle(width, x, y) {
    let v = (y * width) + x;
    return (v < 0) ? 0 : v;
}

function singleToXY(width, single) {
    return {
        x: single % width,
        y: (single - (single % width)) / width
    }
}

/** current_value must be either 0 or 1
 * This code will retain the current value by specified chance default 80%
 * */
function randomDensityBinary(current_value, roundUpWhen = .8) {
    if (Math.random() <= roundUpWhen) return current_value;
    else return current_value ^ 1;
}

/** Single Array but due to xyToSingle, this make things less efficient and slow */
function generateNoiseSingle(width, height) {
    // Iterate from Top-Left to Bottom-Right
    let noise = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            noise[xyToSingle(width, x, y)] = Math.random();
        }
    } return noise;
}

/** Should be similar to propagateNoise, but I change my mind
 * This will just call the specified order of cleaning
 *
 * cellular ->
 * dilate ->
 * dilate ->
 * cellular ->
 * dilate ->
 * cellular ->
 * */
function createMap(map, finish = 0, res = null) {
    if (finish===null) finish = 0;
    if (res === null) {
        return new Promise((resolve, reject) => {
            res = resolve;
            createMap(map, finish, res);
        });
    }else {
        if (cellularAutomata(map)) {
            displayMap(map)
            requestAnimationFrame(function () {
                createMap(map, finish, res);
            }); return false;
        }

        if (finish===2) return res(true);
        if (finish===0) dilate(map);
        dilate(map);
        requestAnimationFrame(function () {
            displayMap(map)
            createMap(map, ++finish, res);
        }); return false;

    }
}

function isHit(map_nb, struct, x, y) {
    const nb = (struct === undefined) ? map_nb : getNeighbors(map_nb, x, y);
    return ((nb & 0b000111000111111000111000) > 0);
}

function isFit(map_nb, struct, x, y ) {
    let nb = (struct === undefined) ? map_nb : getNeighbors(map_nb, x, y);
    nb = nb & 0b000111000111111000111000;
    return ((
        ((nb >> 1) & 0b000001000001001000001000) |
        ((nb >> 2) & 0b000001000001001000001000) |
        nb
    ) === 0b000001000001001000001000);
}

function isMiss(map_nb, struct, x, y) {
    const nb = (struct === undefined) ? map_nb : getNeighbors(map_nb, x, y);
    return ((nb & 0b000111000111111000111000) === 0);
}

function readNeighbor(nb) {
    var r = '';
    r = (nb & 0b111).toString(2).padStart(24, ' ') + ' '  + r;
    r = (nb & 0b111000).toString(2).padStart(24, ' ') + ' ' + r;
    r = (nb & 0b111000000).toString(2).padStart(24, ' ') + ' ' + r;
    r = "\n" + r;
    r = (nb & 0b111000000000).toString(2).padStart(24, ' ') + ' ' + r;
    r = ''.padStart(24, ' ') + ' ' + r;
    r = (nb & 0b111000000000000).toString(2).padStart(24, ' ') + ' ' + r;
    r = "\n" + r;
    r = (nb & 0b111000000000000000).toString(2).padStart(24, ' ') + ' ' + r;
    r = (nb & 0b111000000000000000000).toString(2).padStart(24, ' ') + ' ' + r;
    r = (nb & 0b111000000000000000000000).toString(2).padStart(24, ' ') + ' ' + r;
    return r;
}

function testArea(map) {
    console.log('xy     0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15')
    console.log('')
    for (let y = 0; y < 9; y++) {
        let line = y + '      ';
        for (let x = 0; x < 16; x++) {
            line += map.get(x,y) + '  '
        } console.log(line);
    }
}

function displayMap(map) {
    let imageData = map.context.createImageData(map.width, map.height);
    let data = 0;

    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
            data = map.get(x, y);
            imageData.data[(((y * map.width) + x) * 4)]     = 125 * data;
            imageData.data[(((y * map.width) + x) * 4) + 1] = 125 * data;
            imageData.data[(((y * map.width) + x) * 4) + 2] = 125 * data;
            imageData.data[(((y * map.width) + x) * 4) + 3] = 255;
        }
    }
    map.context.putImageData(imageData, 0, 0);
}

function regionFilling(map, context = null, startX=null, startY=null) {
    let keeps = {};

    let keep = null;
    let single;
    let l,t,r,b,tl,tr,bl,br;
    let existence = false;
    let box, tea, tester;

    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {

            if (map.get(x,y) === 1) {

                // nb = getNeighbors(map, x, y);

                l = xyToSingle(map.width, x-1, y);
                t = xyToSingle(map.width, x, y-1);
                r = xyToSingle(map.width, x+1, y);
                b = xyToSingle(map.width, x, y+1);

                tl = xyToSingle(map.width, x-1, y-1);
                tr = xyToSingle(map.width, x+1, y-1);
                bl = xyToSingle(map.width, x-1, y+1);
                br = xyToSingle(map.width, x+1, y+1);

                existence = false;
                single = xyToSingle(map.width, x, y);

                tester = [tl,t,tr,l,r,bl,br];
                box = [tl,t,tr,l,r,bl,b,br];
                tea = [t,l,r,b];

                for (const current of tester) {
                    keep = checkInKeeps(keeps, current);

                    if (keep !== false) {
                        keeps[keep].push(single);
                        existence = true;
                        break;
                    }
                }
                if (existence === false) keeps[single] = [single];
            }

        }
    } return keeps;
}

function checkInKeeps(keeps, needle) {
    for (const keep of keeps) {
        if (keep.includes(needle)) return keep;
    } return false;
}

/**
 * Find the first x, y coordinate that don't have the value of 0 (zero)
 * */
function getFirstPoint(map, keeps=null, start=0) {
    let single = 0;
    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
            if (start > single) {
                ++single;
                continue;
            }
            if (keeps != null && checkInKeeps(keeps, single)) {
                ++single;
                continue;
            }
            if (map.get(x,y) > 0) return [x, y, single];
            ++single;
        }
    } return false;
}

function connectIsland_BreadthFirstSearch(map, startX, startY) {

    return new Promise((resolve, reject) => {

        let traversed = [];
        let queueX = [];
        let queueY = [];
        let sx = [-1, +1, 0, 0];
        let sy = [0, 0, +1, -1];
        let c = 0, cv = 0;
        let cx, cy,   nx, ny;

        let perHundred = 0;

        queueX.push(startX);
        queueY.push(startY);


        (function loop() {
            ++perHundred;

            cx = queueX.pop();
            cy = queueY.pop();

            // directional
            for (let i = 0; i < 4; i++) {
                nx = cx + sx[i];
                ny = cy + sy[i];

                // left, right, bottom, top
                cv = xyToSingle(map.width, nx, ny);
                if (map.get(nx, ny) > 0 && !traversed.includes(cv)) {
                    traversed.push(cv);
                    queueX.push(nx);
                    queueY.push(ny);
                }

            }

            if ((c = queueX.length) > 0) {
                if (perHundred > (map.width << 1)) {
                    perHundred = 0;
                    requestAnimationFrame(loop);
                }else {
                    if (c === 1)
                        requestAnimationFrame(loop);
                    else
                        loop();
                }
            }else {
                resolve(traversed);
            }
        })();
    });

}

/**
 * Get the group of all points that are connected to each other
 *
 * Don't forget to use await so as to avoid error
 * */
async function getIslands(map) {
    if (map === null) return;

    let islands = [];
    let firstPoint, start;
    let island, islandsCounter;

    // this is to saved the last point to continue to find the next island and save some cpu cycles
    start = 0;

    // firstPoint is just the x,y coordinates

    while ((firstPoint = getFirstPoint(map, islands, start)) !== false) {
        island = await connectIsland_BreadthFirstSearch(map, firstPoint[0], firstPoint[1]);
        start = firstPoint[2]; // merge of x and y into a single number formula is (y*map.width)+x
        islands.push(island);
    }

    return islands;

}

function getSignificantIsland(islands) {

    if (islands === null) return null;
    let highest = 0;
    let significantIsland = null;
    for (const island in islands) {
        if (islands[island].length > highest) {
            highest = islands[island].length;
            significantIsland = islands[island];
        }
    } return significantIsland;

}

function createGameObjects(map) {
    let cv,cn, co;
    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
            /**
             * map.setObject
             *
             * tileWidth
             * tileHeight
             * imageX
             * imageY
             * pixelX
             * pixelY
             *
             * */
            cv = map.get(x, y);
            if (cv === 0) continue;
            cn = getNeighbors(map, x, y);
            co = getSameRule(map, cn);
            map.setObject(x, y, co);

        }
    }
}

function getSameRule(map, neighbor) {
    let sc, bc, sd, bd, r=-1, rold;
    for (const smallNeighbor in map.tileMap.neighbor) {
        /**
         * Small Neighbor
         * 0 = optional
         * 1 = walkable
         * 2 = must be free
         * 3 = walls
         *
         * Big Neighbor
         * 0 = wall
         * 1 = walkable
         *
         * Collision
         * if neighbor & smallNeighbor = smallNeighbor
         *
         * Directional
         *
         *
         * */
        // wall
        sc = singleNeighborHasValue(smallNeighbor, 3);
        bc = singleNeighborHasValue(neighbor, 0);

        // must be open
        sd = singleNeighborHasValue(smallNeighbor, 2);
        bd = singleNeighborHasValue(neighbor, 1);

        if (
            (sc & bc) === sc &&
            (sd & bd) === sd &&
            smallNeighbor > r
        ) r = smallNeighbor;

    } return (r===-1) ? null : map.tileMap.neighbor[r];
}

function focusPlayer(map, x, y) {
    let context = map.context;
    let canvas = context.canvas;
    let edger = [];
    let tile = [];
    let fromX, fromY;
    let toX, toY;
    let diffX, diffY;

    edger[0] = canvas.width % map.tileSize[0];

    edger[1] = canvas.height % map.tileSize[1];

    // how many tiles in a column
    tile[0] = (canvas.width - edger[0]) / map.tileSize[0];

    // how many tiles in a row
    tile[1] = (canvas.height - edger[1]) / map.tileSize[1];

    // addition be added later
    edger[0] /= 2;
    edger[1] /= 2;

    // plus 1 to avoid inconsistency
    tile[0]+=1;
    tile[1]+=1;

    // should be odd or be even?
    if ((tile[0] % 2) === 1) ++tile[0];
    if ((tile[1] % 2) === 1) ++tile[1];

    tile[0] /= 2;
    tile[1] /= 2;

    fromX = x - tile[0];
    fromY = y - tile[0];

    toX = x + tile[0];
    toY = y + tile[0];


    // if from is zero
    if (fromX < 0) {
        toX += (fromX*-1);
        fromX = 0;
    }
    if (fromY < 0) {
        toY += (fromY * -1);
        fromY = 0;
    }

    // if from is greater
    if (fromX >= map.width) {
        toX += (fromX*-1);
        fromX = 0;
    }
    if (fromY >= map.height) {
        toY += (fromY * -1);
        fromY = 0;
    }

    diffX = toX - fromX;
    diffY = toY - fromY;

    let cv = 0;

    context.fillStyle = '#ff0000';
    context.strokeRect(0,0, canvas.width-5, canvas.height-5);

    let edge_x, edge_y;
    edge_x = diffX * map.tileSize[0];
    edge_y = diffY * map.tileSize[1];

    edge_x = (edge_x - canvas.width) / 2
    edge_y = (edge_y - canvas.height) / 2

    for (let cy = 0; cy < diffY; cy++) {
        for (let cx = 0; cx < diffX; cx++) {
            cv = map.get(Math.floor(fromX + cx), Math.floor(fromY + cy));
            context.fillStyle = (cv > 0) ? '#ffffff' : '#111111';
            context.fillRect((cx*map.tileSize[0])-edge_x, (cy*map.tileSize[1])-edge_y, map.tileSize[0], map.tileSize[1])
        }
    }

    context.fillStyle = '#ff0000';
    context.fillRect(((x - fromX)*map.tileSize[0])-edge_x-(map.camera.x-(map.mid.x)), ((y - fromY)*map.tileSize[1])-edge_y-(map.camera.y-(map.mid.y)), map.tileSize[0], map.tileSize[1])

}

function chasePlayer(map, player) {

    if (isNaN(player.counter)) player.counter = 0;
    ++player.counter;

    // initialize camera
    // map.camera.chaseX = (player.pX - (map.context.canvas.width / 2));
    // map.camera.chaseY = ((player.pY - (map.context.canvas.height / 2)));

    // to avoid floating pixel
    // map.camera.x = Math.floor(map.camera.x);
    // map.camera.y = Math.floor(map.camera.y);

    let speedX, speedY;
    speedX = Math.abs(map.camera.chaseX - map.camera.x);
    speedY = Math.abs(map.camera.chaseY - map.camera.y);
    if (speedX > map.tileSize[0]) {
        speedX /= map.tileSize[0];
    }else {
        speedX = 1;
    }
    if (speedY > map.tileSize[1]) {
        speedY /= map.tileSize[1];
    }else {
        speedY = 1;
    }
    speedX = Math.floor(speedX);
    speedY = Math.floor(speedY);

    if (map.camera.x < map.camera.chaseX) {
        map.camera.x += speedX;
    }else if (map.camera.x > map.camera.chaseX) {
        map.camera.x -= speedX;
    }

    if (map.camera.y < map.camera.chaseY) {
        map.camera.y += speedY;
    }else if (map.camera.y > map.camera.chaseY) {
        map.camera.y -= speedY;
    }



    /**
     * translate canvas using camera
     *
     *
     * */



    let edger = [];
    let tile = [];
    let fromX, fromY;
    let toX, toY;
    let cv, cn;

    edger[0] = map.context.canvas.width % map.tileSize[0];
    edger[1] = map.context.canvas.height % map.tileSize[1];

    // how many tiles in a column & row
    tile[0] = (map.context.canvas.width - edger[0]) / map.tileSize[0];
    tile[1] = (map.context.canvas.height - edger[1]) / map.tileSize[1];

    // plus 1 to avoid inconsistency
    tile[0]+=1;
    tile[1]+=1;

    // should be odd or be even?
    if ((tile[0] % 2) === 1) ++tile[0];
    if ((tile[1] % 2) === 1) ++tile[1];

    // mid point
    tile[0] /= 2;
    tile[1] /= 2;

    // Working, camera base on player
    // fromX = player.getX() - tile[0];
    // fromY = player.getY() - tile[0];
    //
    // toX = player.getX() + tile[0];
    // toY = player.getY() + tile[0];

    let tmpX, tmpY;
    tmpX = pixelXtoTileX(map, map.camera.x + (map.context.canvas.width / 2));
    tmpY = pixelYtoTileY(map, map.camera.y + (map.context.canvas.height / 2));

    // tmpX = player.getX();
    // tmpY = player.getY();

    fromX = tmpX - tile[0];
    fromY = tmpY - tile[0];

    toX = tmpX + tile[0];
    toY = tmpY + tile[0];


    // if from is zero
    if (fromX < 0) {
        toX += (fromX*-1);
        // fromX = 0;
    }
    if (fromY < 0) {
        toY += (fromY * -1);
        // fromY = 0;
    }

    // if from is greater
    if (fromX >= map.width) {
        toX += (fromX*-1);
        fromX = 0;
    }
    if (fromY >= map.height) {
        toY += (fromY * -1);
        fromY = 0;
    }

    map.context.save();
    map.context.translate(map.camera.x * -1, map.camera.y * -1);
    player.update();

    map.collisions.length = 0;

    for (let cy = fromY; cy <= toY; cy++) {
        for (let cx = fromX; cx <= toX; cx++) {
            map.draw(cx, cy);

            if (
                (tmpX - 2) < cx &&
                (tmpX + 2) > cx &&
                (tmpY - 2) < cy &&
                (tmpY + 2) > cy &&
                map.get(cx,cy)===0) map.collisions.push({
                'x': cx,
                'y': cy,
                'width': map.tileSize[0],
                'height': map.tileSize[1],
                'px': cx*map.tileSize[0],
                'py': cy*map.tileSize[1]
            });

            //region
            // if (map.getObject(cx, cy) === undefined) {
            //     cv = map.get(cx, cy);
            //     cn = getNeighbors(map, cx, cy);
            // }

            // (cx === player.x && cy === player.y) ? '#ff0000' :
            // this.context.drawImage(this.image, this.translateX, this.translateY, this.translateWidth == 0 ? this.width : this.translateWidth, this.translateHeight == 0 ? this.height : this.translateWidth, this.x, this.y, this.width, this.height);


            // map.context.fillStyle =  ((cv > 0) ? '#ffffff' : '#111111');
            // map.context.fillRect((cx*map.tileSize[0]), (cy*map.tileSize[1]), map.tileSize[0], map.tileSize[1]);
            //endregion

        }
    }

    map.context.fillStyle = '#ff0000';
    map.context.fillRect(Math.floor(player.pX), Math.floor(player.pY), map.tileSize[0], map.tileSize[1]);
    map.context.restore();


}

function pixelXtoTileX(map, pixelSize) {
    return (pixelSize - (pixelSize % map.tileSize[0])) / map.tileSize[0];
}

function pixelYtoTileY(map, pixelSize) {
    return (pixelSize - (pixelSize % map.tileSize[1])) / map.tileSize[1];
}

// function hasCollision(x1,y1,w1,h1,   x2,y2,w2,h2) {
//     return !(
//         ((y1 + h1) < (y2)) ||
//         (y1 > (y2 + h2)) ||
//         ((x1 + w1) < x2) ||
//         (x1 > (x2 + w2))
//     );
// }


// function hasCollision(obj1, obj2, size) {
//     console.log(obj1, obj2,
//         (obj1.x*size.width) + obj1.width >= (obj2.x*size.width) ,
//         (obj1.x*size.width) <= (obj2.x*size.width) + obj2.width,
//         (obj1.y*size.height) <= (obj2.y*size.height) + obj2.height ,
//         (obj1.y*size.height) + obj1.height >= (obj2.y*size.height)
//     );
//     return (
//         (obj1.x*size.width) + obj1.width >= (obj2.x*size.width) &&
//         (obj1.x*size.width) <= (obj2.x*size.width) + obj2.width &&
//         (obj1.y*size.height) <= (obj2.y*size.height) + obj2.height &&
//         (obj1.y*size.height) + obj1.height >= (obj2.y*size.height)
//     )
// }
//


function hasCollision(obj1, obj2) {
    console.log(obj1, obj2,
        (obj1.x) + obj1.width >= (obj2.px) ,
        (obj1.x) <= (obj2.px) + obj2.width,
        (obj1.y) <= (obj2.py) + obj2.height ,
        (obj1.y) + obj1.height >= (obj2.py)
    );
    return (
        (obj1.x) + obj1.width >= (obj2.px) &&
        (obj1.x) <= (obj2.px) + obj2.width &&
        (obj1.y) <= (obj2.py) + obj2.height &&
        (obj1.y) + obj1.height >= (obj2.py)
    );
}






function displayIslands(map, islands) {

    let imageData = map.context.getImageData(0, 0, map.width, map.height);

    for (const island of islands) {
        const randomColor = Math.floor(Math.random()*16777215);
        const r = (randomColor & 0xff0000) >> 16;
        const g = (randomColor & 0x00ff00) >> 8;
        const b = (randomColor & 0x0000ff);

        for (const single of island) {
            imageData.data[(single * 4)]     = r;
            imageData.data[(single * 4) + 1] = g;
            imageData.data[(single * 4) + 2] = b;
            imageData.data[(single * 4) + 3] = 100;
        }
    }

    map.context.putImageData(imageData, 0, 0);
}

function displayIsland(map, island, color = null) {
    let imageData = map.context.getImageData(0, 0, map.width, map.height);

    const r = ((((color === null) ? island[0] : color) ) & 0xff0000) >> 16;
    const g = ((((color === null) ? island[0] : color) ) & 0x00ff00) >> 8;
    const b = ((((color === null) ? island[0] : color) ) & 0x0000ff);

    for (const single of island) {
        imageData.data[(single * 4)]     = r;
        imageData.data[(single * 4) + 1] = g;
        imageData.data[(single * 4) + 2] = b;
        imageData.data[(single * 4) + 3] = 100;
    }

    map.context.putImageData(imageData, 0, 0);
}

function getRandomLocation(map, island) {
    return singleToXY(map.width, island[Math.floor(Math.random() * island.length)]);
}

function testRandomLocation(map, islands, location = null) {
    displayMap(map);
    displayIslands(map, islands);
    let randomLocation = (location === null) ? singleToXY(map.width, main_island[Math.floor(Math.random() * main_island.length)]) : location;
    console.log(randomLocation);
    map.context.fillStyle = '#ff0000';
    map.context.fillRect(randomLocation.x, randomLocation.y, 50,50);
}
















/* Tile Map Editor */

/**
 *
 * */
class TileConstraints {
    tileName = '';
    tileMap;
    tileSize;
    walkable = {};
    walls = {};
    need = {};
    brush = 0;
    width = 0;
    height = 0;
    context;

    toJson() {
        return JSON.stringify({
            'tileName': this.tileName,
            'width': this.width,
            'height': this.height,
            'tileSize': {
                'width': this.tileSize[0],
                'height': this.tileSize[1],
            },
            'walkable': this.walkable,
            'walls': this.walls,
            'need':this.need,
        });
    }
}

/**
 * @return {FileList}
 * */
function openDialog() {
    return new Promise((resolve, reject) => {
        let input = document.createElement("input");
        input.type = "file";
        input.setAttribute("multiple", true);
        input.setAttribute("accept", "image/*");
        input.onchange = function (event) {
            resolve(this.files);
        };
        input.onerror = function () {
            reject();
        }
        input.click();
    });
}

/**
 * @return {HTMLImageElement}
 * */
function bufferToImage(buffer, fileType) {
    return new Promise((resolve, reject) => {

        let arrayBufferView = new Uint8Array( buffer );
        let blob = new Blob( [ arrayBufferView ], { type: fileType } );
        let urlCreator = window.URL || window.webkitURL;
        let imageUrl = urlCreator.createObjectURL( blob );
        let img = new Image();
        img.onload = function () {
            urlCreator.revokeObjectURL(this.src);
            resolve(this);
        };
        img.onerror = function () { reject(); }
        img.src = imageUrl;

    });
}


function fileToBuffer(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = function (e) {
            resolve(e.target.result);
        }; reader.readAsArrayBuffer(file);
    });
}

function tileOrganize(map) {
    // map.tileMap
    // map.tileMapImage

    var tmap,xy, ttile, tint, collisionOnly;
    tmap = generateNoise(map.tileMap.width, map.tileMap.height, 0);

    // main
    for (const walkableKey in map.tileMap.walkable) {
        xy = singleToXY(map.tileMap.width, walkableKey);
        tmap.set(xy.x, xy.y, 1);
    }

    // directional
    for (const needKey in map.tileMap.need) {
        xy = singleToXY(map.tileMap.width, needKey);
        tmap.set(xy.x, xy.y, 2);
    }

    // walls
    for (const wallsKey in map.tileMap.walls) {
        xy = singleToXY(map.tileMap.width, wallsKey);
        tmap.set(xy.x, xy.y, 3);
    }

    tint = 0;
    ttile = {};
    // main
    for (const walkableKey in map.tileMap.walkable) {
        xy = singleToXY(map.tileMap.width, walkableKey);
        tint = getNeighbors(tmap, xy.x, xy.y);
        collisionOnly = singleNeighborHasValue(tint, 3);
        // xy['neighbor'] = tint;
        // collisionOnly = getNeighborsHasValue(tmap, xy.x, xy.y, 3);

        // console.log(tint, '[]', collisionOnly);

        if (ttile[tint] === undefined) ttile[tint] = xy;
        else if(!Array.isArray(ttile[tint])) ttile[tint] = [ttile[tint], xy];
        else ttile[tint].push(xy);
    }

    // console.log(ttile);

    // map
    // console.log(tmap);
    // testArea(tmap);
    // console.log(getNeighbors(tmap, 3, 3));

    return ttile;

}

function fromOldMapToNew(map, oldW=560, newW=35) {
    var tmp;
    var nmap = {};
    for(const oldxy in map) {
        tmp = singleToXY(oldW, oldxy);
        nmap[(xyToSingle(newW, tmp.x, tmp.y))] = 1;
    } return nmap;
}

function editorLoadTileMap(newMap) {
    tile_constraints.walkable = newMap.walkable;
    tile_constraints.walls = newMap.walls;
    tile_constraints.need = newMap.need;
    tile_constraints.tileSize = [newMap.tileSize.width, newMap.tileSize.height];
}

/* Unused Functions */

function regionFillingBFS(map, context, startX, startY) {
    let traversed = [];
    let queueX = [];
    let queueY = [];
    let sx = [-1, +1, 0, 0];
    let sy = [0, 0, +1, -1];
    let c = 0, cv = 0;
    let cx, cy,   nx, ny;

    queueX.push(startX);
    queueY.push(startY);

    while ((c = queueX.length) > 0) {
        cx = queueX.pop();
        cy = queueY.pop();


        // directional
        for (let i = 0; i < 4; i++) {
            nx = cx + sx[i];
            ny = cy + sy[i];

            // left, right, bottom, top
            cv = xyToSingle(map.width, nx, ny);
            if (map.get(nx, ny) > 0 && !traversed.includes(cv)) {
                traversed.push(cv);
                queueX.push(nx);
                queueY.push(ny);
            }

        }

    }
    return traversed;
}

function regionFillingUsingDepthFirstSearch(map, context, startX, startY) {
    let traversed = [];
    let x=startX, y=startY, single;
    let t, r, b, l, counter = 0;
    let tl, tr, bl, br;

    let vt,vr,vb,vl;
    let vtl,vtr,vbl,vbr;
    let stopper = false;
    (async function loop() {
        single = xyToSingle(map.width, x, y);
        t = xyToSingle(map.width, x,y-1);
        r = xyToSingle(map.width, x+1,y);
        b = xyToSingle(map.width, x,y+1);
        l = xyToSingle(map.width, x-1,y);

        tl = xyToSingle(map.width, x-1,y-1);
        tr = xyToSingle(map.width, x+1,y-1);
        bl = xyToSingle(map.width, x-1,y+1);
        br = xyToSingle(map.width, x+1,y+1);

        vt = map.get(x,y-1);
        vr = map.get(x+1,y);
        vb = map.get(x,y+1);
        vl = map.get(x-1,y);

        vtl = map.get(x-1,y-1);
        vtr = map.get(x+1,y-1);
        vbl = map.get(x-1,y+1);
        vbr = map.get(x+1,y+1);


        if ((vt > 0) && (traversed.includes(t) === false)) {
            // top
            --y;
        }else if ((vr > 0) && (traversed.includes(r) === false)) {
            // right
            ++x;
        }else if ((vb > 0) && (traversed.includes(b) === false)) {
            // bottom
            ++y;
        }else if ((vl > 0) && (traversed.includes(vl) === false)) {
            // left
            --x;
        }else if ((vtl > 0) && (traversed.includes(tl) === false)) {
            // topleft
            --y;
            --x;
        }else if ((vtr > 0) && (traversed.includes(tr) === false)) {
            // topright
            --y;
            ++x;
        }else if ((vbr > 0) && (traversed.includes(br) === false)) {
            // bottomright
            ++x;
            ++y;
        }else if ((vbl > 0) && (traversed.includes(bl) === false)) {
            // bottomleft
            --x;
            ++y;
        }else {
            console.log('stop');
            stopper=true;
        } ++counter;

        // if ((vtl > 0) && (traversed.includes(tl) === false)) {
        //     // topleft
        //     --y;
        //     --x;
        // }else if ((vt > 0) && (traversed.includes(t) === false)) {
        //     // top
        //     --y;
        // }else if ((vtr > 0) && (traversed.includes(tr) === false)) {
        //     // topright
        //     --y;
        //     ++x;
        // }else if ((vr > 0) && (traversed.includes(r) === false)) {
        //     // right
        //     ++x;
        // }else if ((vbr > 0) && (traversed.includes(br) === false)) {
        //     // bottomright
        //     ++x;
        //     ++y;
        // }else if ((vb > 0) && (traversed.includes(b) === false)) {
        //     // bottom
        //     ++y;
        // }else if ((vbl > 0) && (traversed.includes(bl) === false)) {
        //     // bottomleft
        //     --x;
        //     ++y;
        // }else if ((vl > 0) && (traversed.includes(vl) === false)) {
        //     // left
        //     --x;
        // }else {
        //     console.log('stop');
        //     stopper=true;
        // } ++counter;



        traversed.push(single);
        // await new Promise(r => setTimeout(r, 50));
        displayIsland(map, context, {'one': traversed}, 'one');
        if (!stopper)
            requestAnimationFrame(loop);
    })();
    return traversed;
}

function regionFillingRecursive(map, context, startX=null, startY=null) {
    if (startX == null) {
        console.log('regionFilling');
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                if (map.get(x,y) === 1) {
                    console.log(x, y, map.get(x,y));
                    regionFilling(map, context, x, y);
                    return;
                }
            }
        }
    } else {
        let nb = 0;
        nb = getNeighbors(map, startX, startY);
        map.set(startX, startY, 2); // not sure, possible to just create new array
        // lets try the changing pixel first
        // if ((nb & 0b001 << 21) > 0) regionFilling(map, context, startX-1, startY-1);
        if ((nb & 0b001 << 18) > 0) regionFilling(map, context, startX, startY-1);
        // if ((nb & 0b001 << 15) > 0) regionFilling(map, context, startX+1, startY-1);

        if ((nb & 0b001 << 12) > 0) regionFilling(map, context, startX-1, startY);
        if ((nb & 0b001 << 9) > 0) regionFilling(map, context, startX+1, startY);

        // if ((nb & 0b001 << 6) > 0) regionFilling(map, context, startX-1, startY+1);
        if ((nb & 0b001 << 3) > 0) regionFilling(map, context, startX, startY+1);
        // if ((nb & 0b001) > 0) regionFilling(map, context, startX+1, startY+1);

        requestAnimationFrame(function () {
            displayMap(map, context);
        });
    }
}
