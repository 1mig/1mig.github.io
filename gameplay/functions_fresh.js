
function getVisibleObjects(objects, from, to) {
    var result = null;
    for (const obj of objects) {
        if (obj.x >= from.x && obj.x <= to.x &&
            obj.y >= from.y && obj.y <= to.y) {
                if (result === null) result = [];
                result.push(obj);
                // obj.draw('#00ff00');
            }
    } return result;
}

function getVisibleBoundary(map, x, y) {
    // x, y is the middle point

    // remove remainder in division [ canvas width % tile_scale ]
    let edger = {
        x: 0,
        y: 0
    };
    // how many tile in x and y
    let tile = {
        x: 0,
        y: 0
    };
    let half = {
        x: 0,
        y: 0
    }

    // get remainder
    edger.x = map.canvas.width % map.tile.size.width;
    edger.y = map.canvas.height % map.tile.size.height;

    // get how many tiles is fitted on the canvas screen
    tile.x = (map.canvas.width - edger.x) / map.tile.size.width;
    tile.y = (map.canvas.height - edger.y) / map.tile.size.height;

    // additional 1 boundary AND should always be even
    ++tile.x;++tile.x; if ((tile.x % 2) === 1) ++tile.x;
    ++tile.y;++tile.y; if ((tile.y % 2) === 1) ++tile.y;

    // get mid point
    half.x = tile.x / 2;
    half.y = tile.y / 2;
    
 
    return {...tile, half: half};

}

// function arrayContainsObject(arr1, key, value) {
//     for (const obj of arr1) {
//         if (obj[key] === value) return true;
//     } return false;
// }

function getLerp(start, end, t) {return start * (1-t) + end * t;}