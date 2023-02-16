const canvas = document.getElementsByTagName('canvas')[0];
const context = canvas.getContext('2d');

const ratioScale = 32;

let map = generateNoise(16 * ratioScale, 9 * ratioScale, -1);
canvas.width = map.width;
canvas.height = map.height;
map['context'] = context;
map['tileMap'] = null;
map['tileMapImage'] = null;
map['tileSize'] = [16,16];
map['scale'] = 64;
map['keymap'] = {};
map['arrow'] = [37, 38, 39, 40];
map['camera'].x = map.tileSize[0];
map['camera'].y = map.tileSize[1];
map['mid'] = [];
map['mid'].x = map.tileSize[0];
map['mid'].y = map.tileSize[1];
map['collisions'] = [];
var islands;
var main_island;
var player;
var game;

function gameStart(map) {

    // Create a random spawn point for the player
    // let randomLocation = getRandomLocation(map, main_island);
    // testRandomLocation(map, islands, randomLocation);
    // focusPlayer(map, randomLocation.x, randomLocation.y);



    game = new GameScene(map);
    player = new Player(map);
    player.setLocation(getRandomLocation(map, main_island));
    player.resetCamera();

    // main config
    game.bindController = map.keymap;
    game.bindPlayer = player;
    game.start();

}


createMap(map).then(async () => {
    displayMap(map);

    // Generate Islands using Map -> get the largest island
    islands = await getIslands(map);
    main_island = getSignificantIsland(islands);

    console.log('Map has been generated');

    onkeydown = onkeyup = function(e){ e = e || event; map['keymap'][e.keyCode] = e.type == 'keydown';}

    // Since the map has been generated, one can play the game by clicking "Game Start"
    let span = document.getElementsByTagName('span')[3];
    span.style.display = 'block';

    // gameStart(map);
    gameBuffering(map);
});

/** Next Plans
 * Camera
 * Tiling
 * Player
 * Collisions
 *
 * */

/** Display by Coloring the largest island
 * displayIsland(map, main_island, Math.floor(Math.random()*16777215));
 * */
