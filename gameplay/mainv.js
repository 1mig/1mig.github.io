//#region Initialization
const canvas = document.getElementsByTagName('canvas')[0];
const context = canvas.getContext('2d');
const default_scale = 16;
canvas.width += 4;
canvas.height += 10;

var map = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]

var player, obstacle, obstacle2;
var camera = {x: 0,y: 0, speed: 4};
var all_objs = [];
var map_objs = [];
var misc_objs = [];
var back_objs = {
    previous: [],
    current: [],
    merge: function (a,b) {
        if (a === undefined || b === undefined) a = this.previous, b = this.current;
        const result = [];
        for (let i = 0; i < a.length; i++) {
            if (!result.includes(a[i])) result.push(a[i]);
        }
        for (let i = 0; i < b.length; i++) {
            if (!result.includes(b[i])) result.push(b[i]);
        }
        return result;
    }
};
//#endregion

//#region map
map.keymap = {};
map.canvas = canvas;
map.context = context;
map.scale = 2;
map.tile = {};
map.tile.size = {width: 16 * map.scale, height: 16 * map.scale}
map.width = 19;
map.getHeight = function() { return this.length / this.width; };
map.get = function(x, y) {
    const z = (y * this.width) + Math.min(x, this.width-1);
    return map[z];
}
map.draw = function(x, y) {
    if (y === undefined) {
        [x, y] = [
            x % this.width,
            (x - (x % this.width)) / this.width,
        ];
    }
    map.context.fillStyle = (this.get(x, y) === 0) ? '#5555ff' : '#ffffff';
    context.fillRect(x * map.tile.size.width, y * map.tile.size.height, map.tile.size.width, map.tile.size.height);
}
//#endregion

//#region GameObject Class
class GameObject {
    context;  x; y;  vx=0; vy=0;  gx=0; gy=0;
    align_collision; collided_obj = [];lerp=0;
    collision = {
        width: default_scale,
        height: default_scale
    }
    size = {
        width: default_scale,
        height: default_scale
    }
    constructor(context, x, y, size, collision, align_collision = 7) {
        this.x = x;
        this.y = y;
        this.context = context;
        this.align_collision = align_collision;
        this.size      = (size      === undefined) ? this.size      : size;
        this.collision = (collision === undefined) ? (this.size === undefined ? this.collision : this.size) : collision;
    }
    draw(color=undefined) {
        context.fillStyle = (color) ?? '#ff0000';
        context.fillRect(this.x, this.y, this.size.width, this.size.height);
    }
    
    drawBack(color=undefined) {
        context.save();

        var a = GameObject.getAlignCollision(this);
        
        // Create clipping path
        let region = new Path2D();
        region.rect(this.x, this.y, this.size.width, this.size.height);
        region.rect(this.x+a.x, this.y+a.y, this.collision.width, this.collision.height);
        context.clip(region, "evenodd");

        context.fillStyle = (color) ?? '#ff0000';
        context.fillRect(this.x, this.y, this.size.width, this.size.height);
        context.restore();
    }
    collide(added_x, added_y, ...obj) {
        if (Array.isArray(obj)) {
            if (obj.length > 1) {
                for (const o of obj) {
                    if (this.collide(added_x, added_y,o)) return true;
                } 
                return false;
            }else if(obj.length === 1) obj = obj[0];
            else {
                console.log('The code should not reached here: empty collide');
                return false;
            }
        }


        var a = GameObject.getAlignCollision(obj);
        var b = GameObject.getAlignCollision(this);
        
        var f1,f2;
        var f2_1, f2_2, f2_3, f2_4;
        
        // image boundary
        f1 = (this.x + this.collision.width + added_x + b.x > obj.x && 
            obj.x + obj.size.width > this.x + added_x + b.x && 
            this.y + this.collision.height + added_y + b.y > obj.y && 
            obj.y + obj.size.height > this.y + added_y + b.y);
        
        // collision boundary
        f2_1 = this.x + this.collision.width + added_x + b.x > obj.x + a.x;
        f2_2 = obj.x + obj.collision.width + a.x > this.x + added_x + b.x;
        f2_3 = this.y + this.collision.height + added_y + b.y > obj.y + a.y;
        f2_4 = obj.y + obj.collision.height + a.y > this.y + added_y + b.y;

        f2 = (f2_1 && f2_2 && f2_3 && f2_4);

        // if player is at the back of the object
        if (f1 && !f2 && !back_objs.current.includes(obj)) back_objs.current.push(obj);

        // save collided objects
        if (f2 && !this.collided_obj.some(function(ele) {return ele.obj === obj;})) {
            this.collided_obj.push({obj: obj, add_x: added_x, add_y: added_y});
        }
        
        return f2;
    }
    static getAlignCollision(obj) {
        
        //#region Align Collision
        var a = {
            x:0,
            y:0
        };
        switch (obj.align_collision) {
            // top left
            case 0: a.x = 0; a.y = 0; break;
            // top center
            case 1: a.x = Math.floor(Math.abs(obj.size.width - obj.collision.width)/2); a.y = 0; break;
            // top right
            case 2: a.x = Math.abs(obj.size.width - obj.collision.width); a.y = 0; break;

            // mid left
            case 3: a.x = 0; a.y = Math.floor(Math.abs(obj.size.height - obj.collision.height)/2); break;
            // mid center
            case 4: a.x = Math.floor(Math.abs(obj.size.width - obj.collision.width)/2); a.y = Math.floor(Math.abs(obj.size.height - obj.collision.height)/2); break;
            // mid right
            case 5: a.x = Math.abs(obj.size.width - obj.collision.width); a.y = Math.floor(Math.abs(obj.size.height - obj.collision.height)/2); break;

            // bottom left
            case 6: a.x = 0; a.y = Math.abs(obj.size.height - obj.collision.height); break;
            // bottom center
            case 7: a.x = Math.floor(Math.abs(obj.size.width - obj.collision.width)/2); a.y = Math.abs(obj.size.height - obj.collision.height); break;
            // bottom right
            case 8: a.x = Math.abs(obj.size.width - obj.collision.width); a.y = Math.abs(obj.size.height - obj.collision.height); break;

        }
        //#endregion
        return a;

    }
    clone() {
        return new GameObject(this.context, this.x, this.y, this.size, this.collision);
    }
}
//#endregion

//#region Objects
player = new GameObject(map.context, 2 * map.tile.size.width, 2 * map.tile.size.height, {width: 32, height: 32}, {width: 32, height: 28}); // 012 345 678
obstacle = new GameObject(map.context, 4 * map.tile.size.width, 3 * map.tile.size.height, {width: 32, height: 32}, {width: 32, height: 16});
obstacle2 = new GameObject(map.context, 4 * map.tile.size.width, 1 * map.tile.size.height, {width: 32, height: 32}, undefined, 2);
all_objs.push(obstacle, obstacle2);
//#endregion





















var visibleBoundary = getVisibleBoundary(map);
visibleBoundary.x *= map.tile.size.width;
visibleBoundary.y *= map.tile.size.height;
visibleBoundary.half.x *= map.tile.size.width;
visibleBoundary.half.y *= map.tile.size.height;
console.log(visibleBoundary);
player.gx = player.x; // to be removed
player.gy = player.y;

onkeydown = onkeyup = function(e){ e = e || event; map.keymap[e.keyCode] = e.type == 'keydown';};

(function loop() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(camera.x * -1, camera.y * -1);
    
    for (let i = 0; i < map.length; i++) {
        map.draw(i);
    }
    
    cameraToPlayer(player);
    
    player.draw();

    playerMovement(map.keymap, player);

    drawBackLayer();
    context.restore();

    requestAnimationFrame(loop);
})();

// when you are behind the house
function drawBackLayer() {
    if (back_objs.current.length > 0 || back_objs.previous.length) {
        const new_back = back_objs.merge();
        for (const obj of new_back) {
            obj.drawBack('#00550099');
        }
    }
}

function cameraToPlayer(player) {
    
    let speed = {
        x:0,
        y: 0
    }
    let chase = {
        x:(player.x - (canvas.width  / 2) + (player.size.width / 2)),
        y:(player.y - (canvas.height / 2) + (player.size.height / 2))
    }

    speed.x = Math.abs(chase.x - camera.x);
    speed.y = Math.abs(chase.y - camera.y);

    if (speed.x >= (map.tile.size.width/camera.speed)) speed.x /= (map.tile.size.width/camera.speed); else speed.x = 1;
    if (speed.y >= (map.tile.size.height/camera.speed)) speed.y /= (map.tile.size.height/camera.speed); else speed.y = 1;
    
    speed.x = Math.floor(speed.x);
    speed.y = Math.floor(speed.y);

    if (camera.x !== chase.x) camera.x += (camera.x < chase.x) ? speed.x : - speed.x;
    if (camera.y !== chase.y) camera.y += (camera.y < chase.y) ? speed.y : - speed.y;

    let from = {
        x: 0,
        y: 0
    };
    let to = {
        x: 0,
        y: 0
    };

    from.x = camera.x - visibleBoundary.half.x;
    from.y = camera.y - visibleBoundary.half.y;
    to.x = camera.x + visibleBoundary.half.x;
    to.y = camera.y + visibleBoundary.half.y;
    if (from.x < 0) to.x += (from.x*-1);
    if (from.y < 0) to.y += (from.y*-1);

    if (from.x >= map.width * map.tile.size.width) to.x += from.x*-1;
    if (from.y >= map.height * map.tile.size.height) to.y += from.y*-1;
    
    var significantObjects = getVisibleObjects(all_objs, from, to);
    if (significantObjects !== null)
    for (const obj of significantObjects) {
        obj.draw('#00ff00');
    }
    
}

function playerMovement(keymap, player) {
    
    //#region Player is already decelarating
    var decelarating = false;
    var ax,ay,rx,ry;
    ax = Math.abs(player.vx);
    ay = Math.abs(player.vy);

    rx = Math.round(player.vx);
    ry = Math.round(player.vy);
    
    if (ax <= .5) { player.vx = 0;ax=0; }
    if (ay <= .5) { player.vy = 0;ay=0; }

    if (Math.abs(player.vx) > 0.5) {
        if (player.collide(rx, 0, ...all_objs)){    
            player.vx *= .25;
            decelarating = true;
        }else player.x += rx;
        
    }
    if (Math.abs(player.vy) > 0.5) {
        if (player.collide(0, ry, ...all_objs)) {
            player.vy *= .25;
            decelarating = true;
        }else player.y += ry;
    } if (decelarating) return;
    //#endregion

    //#region KeyDown Movements
    var hasMovement = false;
    var attempt_move = false;
    const velocity_point = 1;

    if (keymap['37']) {
        // left
        player.vx += -velocity_point;
        attempt_move = true;
    }
    if (keymap['38']) {
        // top
        player.vy += -velocity_point;
        attempt_move = true;
    }
    if (keymap['39']) {
        // right
        player.vx += velocity_point;
        attempt_move = true;
    }
    if (keymap['40']) {
        // bottom
        player.vy += velocity_point;
        attempt_move = true;
    }
    if (attempt_move) {
        player.gx = player.x;
        player.gy = player.y;
    }
    if (keymap['16']) {
        if (player.gx === player.x && player.gy === player.y) {
            player.gx = Math.floor(player.x) + (player.vx*100);
            player.gy = Math.floor(player.y) + (player.vy*100);
            player.vx *= 0;
            player.vy *= 0;
            player.lerp = 0;
            console.log(player.x,player.y,player.gx,player.gy);
        }
    }
    rx = Math.round(player.vx);
    ry = Math.round(player.vy);
    ax = Math.abs(rx);
    ay = Math.abs(ry);
    //#endregion

    //#region Move if there is collision
    
    var lerp = {x:0, y:0, vx:0, vy:0};

    player.lerp += .05;
    lerp.x = getLerp(player.x, player.gx, player.lerp); // player.vx;
    lerp.y = getLerp(player.y, player.gy, player.lerp); // player.vy;

    if (player.lerp > 1) player.lerp = 0;

    lerp.vx = (player.x - lerp.x);
    lerp.vy = (player.y - lerp.y);

    if (player.x === player.gx) {
        console.log('x is the same');
    }

    // console.log(lerp, player.x, player.y);

    // if (attempt_move) // remove this if you preserve collided_obj
    player.collided_obj.length = 0;
    
    back_objs.current.length = 0;
    if (back_objs.previous.length === 0 && (player.vx == 0 || player.vy == 0)) back_objs.length = 0;
    
    // without lerp
    if (ax > 0 && !player.collide(player.vx, 0, ...all_objs)) {player.x += rx;hasMovement=true;}
    if (ay > 0 && !player.collide(0, player.vy, ...all_objs)) {player.y += ry;hasMovement=true;}

    // lerp testing
    // if (ax > 0 && !player.collide(lerp.vx, 0, ...all_objs)) {player.x = lerp.vx;hasMovement=true;}
    // if (ay > 0 && !player.collide(0, lerp.vy, ...all_objs)) {player.y = lerp.vy;hasMovement=true;}
   
    if (Math.abs(player.gx) > 0) {
        if (player.vx === 0) {
            player.x = (lerp.x);
        }
        if (player.vy === 0)
        player.y = (lerp.y);
    }

    // if ((player.vx === 0 && player.vy === 0) && attempt_move) {
    //     console.log(player.gx, player.gy, lerp);
    // }

    //#endregion
    
    // /*

    //#region Collided Objects
    // this will smooth out when player goes against a wall
    if (player.collided_obj.length > 0) {
        for (const col_obj of player.collided_obj) {
            var reverse, i;

            if (col_obj.add_x !== 0) {
                // x-axis
                reverse = col_obj.add_x > 0 ? -1 : 1;
                i = Math.floor(col_obj.add_x);
                while(i !== 0) { i += reverse;
                    if (!player.collide(i, 0, col_obj.obj)) {
                        // you can add durability property and subtract it base on the i <- which is the speed
                        player.x += i; hasMovement=true;
                        break;
                    }
                }

            }
            
            if (col_obj.add_y !== 0) {
                // y-axis
                reverse = col_obj.add_y > 0 ? -1 : 1;
                i = Math.floor(col_obj.add_y);
                while(i !== 0) { i += reverse;
                    // durability here also
                    if (!player.collide(0, i, col_obj.obj)) {
                        player.y += i; hasMovement=true;
                        break;
                    }
                }
                
            }
        }
    }
    //#endregion

    // */

    //#region Accelaration or Step by step

    // Acceleration #####
    // player.vx *= .98;
    // player.vy *= .98;

    // Step by Step #####
    player.vx = 0;
    player.vy = 0;
    //#endregion

    if (hasMovement) {
        // cameraToPlayer(player);
        
        if (back_objs.current.length > 0) {
            for (let i = 0; i < back_objs.current.length; i++) {
                if (!back_objs.previous.includes(back_objs.current[i]))
                    back_objs.previous.push(back_objs.current[i]);
            }
        }
    
        if (back_objs.current.length === 0) {
            back_objs.previous.length = 0;
        }
    }

}

/** 
 * Map Objects
 * Player Objects
 * Miscellaneous Objects
 */

