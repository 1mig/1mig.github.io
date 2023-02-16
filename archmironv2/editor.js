const container = document.getElementsByTagName('div')[1];
const canvasList = document.getElementsByTagName('canvas');
const canvas = canvasList[0];
const context = canvas.getContext('2d');

const canvas2 = canvasList[1];
const context2 = canvas2.getContext('2d');

let tile_constraints = new TileConstraints();
tile_constraints.context = context;
tile_constraints.tileSize = [16, 16];

async function loadImage() {
    let f = (await openDialog())[0];
    let buffer = await fileToBuffer(f);
    let img = await bufferToImage(buffer, f.type);
    tile_constraints.tileName = f.name;
    tile_constraints.tileMap = img;
    tile_constraints.width = img.width / tile_constraints.tileSize[0];
    tile_constraints.height = img.height / tile_constraints.tileSize[1];
    canvas.width = img.width;
    canvas.height = img.height;
    canvas2.width = img.width;
    canvas2.height = img.height;
    container.style.width = img.width + 'px';
    container.style.paddingBottom = img.height + 'px';
    context.drawImage(img, 0, 0);
}

function setTilePixelSize() {
    let pixelWidth = prompt('Define x:', 16);
    if (isNaN(pixelWidth)) return;
    let pixelHeight = prompt('Define y:', 16);
    if (isNaN(pixelHeight)) return;

    pixelWidth = Number.parseInt(pixelWidth);
    pixelHeight = Number.parseInt(pixelHeight);

    tile_constraints.tileSize = [pixelWidth, pixelHeight];
    tile_constraints.width = img.width / tile_constraints.tileSize[0];
    tile_constraints.height = img.height / tile_constraints.tileSize[1];

    context2.imageSmoothingEnabled = false;
    context2.fillStyle = '#dd3333aa';
    context2.fillRect(1*pixelWidth,1*pixelHeight,pixelWidth,pixelHeight);
}

// generate mouse events
(function (constraints) {
    let isDown = false;
    canvas2.onmousedown = function (ev) { isDown = true; mouseDownAndMove(ev); };
    canvas2.onmouseup = function () { isDown = false; };
    canvas2.onmouseleave = canvas2.onmouseup;
    canvas2.onmousemove = mouseDownAndMove;

    function mouseDownAndMove(ev) {
        if (!isDown) return;
        let x,y,rect,single;
        rect = canvas2.getBoundingClientRect();
        x = (ev.offsetX);
        y = (ev.offsetY);

        x = Math.floor(x / (constraints.tileSize[0]));
        y = Math.floor(y / (constraints.tileSize[1]));

        single = xyToSingle(constraints.width, x, y);
        if (isNaN(single)) return;

        if (
            constraints.brush !== 3 &&
            (
                (single in constraints.walls) ||
                (single in constraints.walkable) ||
                (single in constraints.need)
            )
        ) return;

        switch (constraints.brush) {
            case 0:
                // walls
                constraints.walls[single] = 1;
                break;
            case 1:
                // need
                constraints.walkable[single] = 1;
                break;
            case 2:
                // need
                constraints.need[single] = 1;
                break;
            case 3:
                // eraser
                delete (constraints.walls[single]);
                delete (constraints.walkable[single]);
                delete (constraints.need[single]);
                break;
        } drawCollisions()
    }


    function drawCollisions() {
        context2.clearRect(0,0,context2.canvas.width,context2.canvas.height);
        context2.imageSmoothingEnabled = false;
        context2.fillStyle = '#dd3333aa'
        for (const key in constraints.walls) {
            let nkey = singleToXY(constraints.width, parseInt(key));
            context2.fillRect(nkey.x*constraints.tileSize[0],nkey.y*constraints.tileSize[1], constraints.tileSize[0],constraints.tileSize[1]);
        }
        context2.fillStyle = '#47dd33'
        for (const key in constraints.walkable) {
            let nkey = singleToXY(constraints.width, parseInt(key));
            context2.fillRect(nkey.x*constraints.tileSize[0],nkey.y*constraints.tileSize[1], constraints.tileSize[0],constraints.tileSize[1]);
        }
        context2.fillStyle = '#ddbe33aa'
        for (const key in constraints.need) {
            let nkey = singleToXY(constraints.width, parseInt(key));
            context2.fillRect(nkey.x*constraints.tileSize[0],nkey.y*constraints.tileSize[1], constraints.tileSize[0],constraints.tileSize[1]);
        }
    }

})(tile_constraints);

/** Next Plans
 *
 * Tile Editor
 * Camera
 * Tiling
 * Player
 * Collisions
 *
 * */