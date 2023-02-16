class GameScene {
    #keymap;
    #map;
    #player;
    counter;
    moving;


    constructor(map) {
        this.#map = map;
        this.counter = 0;

        // This is the code hack to bypass undefine function
        let self = this;
        this.loop = function() {self.update(self);}
    }

    update() {

        this.playerMovements();
        chasePlayer(this.#map, this.#player);
        requestAnimationFrame(this.loop);
    }

    cameraToPlayer() {

    }

    playerMovements() {
        this.moving = false;
        let max_velocity = 10;
        let velocity_point = 1;
        let restoreX, restoreY;
        restoreX = this.#player.pVX;
        restoreY = this.#player.pVY;
        this.#player.pVX = 0;
        this.#player.pVY = 0;
        if (this.#keymap['37']) {
            // left
            this.#player.pVX -= velocity_point;
            if (Math.abs(this.#player.pVX) > max_velocity) this.#player.pVX += velocity_point;
            this.moving = true;
        }
        if (this.#keymap['38']) {
            // top
            this.#player.pVY -= velocity_point;
            if (Math.abs(this.#player.pVY) > max_velocity) this.#player.pVY += velocity_point;
            this.moving = true;
        }
        if (this.#keymap['39']) {
            // right
            this.#player.pVX += velocity_point;
            if (Math.abs(this.#player.pVX) > max_velocity) this.#player.pVX -= velocity_point;
            this.moving = true;
        }
        if (this.#keymap['40']) {
            // bottom
            this.#player.pVY += velocity_point;
            if (Math.abs(this.#player.pVY) > max_velocity) this.#player.pVY -= velocity_point;
            this.moving = true;
        }

        //region acceleration
        // if (this.moving) {
        //     this.decelerationTime = Date.now();
        //
        //     this.#player.initialVelocityX = (Math.abs(this.#player.pVX));
        //     this.#player.initialVelocityY = (Math.abs(this.#player.pVY));
        //     this.#player.endDurationX = this.#player.duration(this.#player.initialVelocityX);
        //     this.#player.endDurationY = this.#player.duration(this.#player.initialVelocityY);
        //     if (!isFinite(this.#player.endDurationX)) this.#player.endDurationX = 0;
        //     if (!isFinite(this.#player.endDurationY)) this.#player.endDurationY = 0;
        //
        // }
        // this.#player.decelerate();
        // if ((Date.now() - this.decelerationTime) > (this.#player.endDurationX*1000) && parseInt(this.#player.pVX)===0) {
        //     this.#player.resetVelocityX();
        // }
        // if ((Date.now() - this.decelerationTime) > (this.#player.endDurationY*1000) && parseInt(this.#player.pVY)===0) {
        //     this.#player.resetVelocityY();
        // }
        //endregion

        // if (
        //     ((this.#player.pX > (this.#player.pX + this.#player.pVX)) && this.#map.get(pixelXtoTileX(this.#map,this.#player.pX + this.#player.pVX), this.#player.getY()) !== 0) ||
        //     ((this.#player.pX < (this.#player.pX + this.#player.pVX)) && this.#map.get(pixelXtoTileX(this.#map,this.#player.pX + this.#player.pVX + this.#map.tileSize[0]), this.#player.getY()) !== 0)
        // ) {
        //     this.#player.pX += (this.#player.pVX);
        // }else {
        //     this.#player.pVX *=.5;
        //     // this.#player.pVX = restoreX;
        // }
        // if (
        //     ((this.#player.pY > (this.#player.pY + this.#player.pVY)) && this.#map.get(this.#player.getX(), pixelYtoTileY(this.#map,this.#player.pY + this.#player.pVY)) !== 0) ||
        //     ((this.#player.pY < (this.#player.pY + this.#player.pVY)) && this.#map.get(this.#player.getX(), pixelYtoTileY(this.#map,this.#player.pY + this.#player.pVY + this.#map.tileSize[1])) !== 0)
        // ) {
        //     this.#player.pY += (this.#player.pVY);
        // }else {
        //     this.#player.pVY *=.5;
        //     // this.#player.pVY = restoreY;
        // }

        let hasCX = false, hasCY = false;
        let s = {
            width: 16,
            height: 16
        };


        for (const collision of map.collisions) {
            if (hasCX && hasCY) continue;
            if (hasCollision({
                x: this.#player.pX + this.#player.pVX,
                y: this.#player.pY ,
                width: this.#player.size.width,
                height: this.#player.size.height
            }, collision, s)) {
                hasCX = true;
            }
            if (hasCollision({
                x: this.#player.pX,
                y: this.#player.pY + this.#player.pVY,
                width: this.#player.size.width,
                height: this.#player.size.height
            }, collision, s)) {
                hasCY = true;
            }

        }

        //region collision com
        // for (const collision of map.collisions) {
        //     if (hasCX && hasCY) continue;
        //     if (hasCollision({
        //         x: pixelXtoTileX(this.#map, this.#player.pX + this.#player.pVX),
        //         y: this.#player.getY(),
        //         width: this.#player.size.width,
        //         height: this.#player.size.height
        //     }, collision, s)) {
        //         hasCX = true;
        //     }
        //     break;
        //     if (hasCollision({
        //         x: this.#player.getX(),
        //         y: pixelYtoTileY(this.#map, this.#player.pY + this.#player.pVY),
        //         width: this.#player.size.width,
        //         height: this.#player.size.height
        //     }, collision, s)) {
        //         hasCY = true;
        //     }
        //     break;
        // }
        //endregion
        if (!hasCX) {
            this.#player.pX += (this.#player.pVX);
        }else {
            this.#player.pVX*=.5;
        }

        if (!hasCY) {
            this.#player.pY += (this.#player.pVY);
        }else {
            this.#player.pVY*=.5;
        }


        // this.#player.pX += (this.#player.pVX);
        // this.#player.pY += (this.#player.pVY);

        this.#map.camera.chaseX = (Math.floor(this.#player.pX) - (this.#map.context.canvas.width / 2));
        this.#map.camera.chaseY = (Math.floor(this.#player.pY) - (this.#map.context.canvas.height / 2));


        //region
        // this.#player.pVX = Math.round((this.#player.pVX + Number.EPSILON) * 100) / 100;
        // this.#player.pVY = Math.round((this.#player.pVY + Number.EPSILON) * 100) / 100;
        // console.log(this.#player.pVX, this.#player.pVY);
        // this.moving = this.moving || (this.#player.pVX == 0 && this.#player.pVY == 0);

        // movement with velocity
        // this.#player.pX += Math.floor(this.#player.pVX);
        // this.#player.pY += Math.floor(this.#player.pVY);
        //endregion

        //region
        // hasCollision(
        //     this.#player.pX,
        //     this.#player.pY,
        //     this.#map.tileSize[0],
        //     this.#map.tileSize[1],
        //
        //     this.#player.pX + this.#player.pVX,
        //     this.#player.pY + this.#player.pVY,
        //     this.#map.tileSize[0],
        //     this.#map.tileSize[1],
        // )

        // if (
        //     ((this.#player.pX > (this.#player.pX + this.#player.pVX)) && this.#map.get(pixelXtoTileX(this.#map,this.#player.pX + this.#player.pVX), this.#player.getY()) !== 0) ||
        //     ((this.#player.pX < (this.#player.pX + this.#player.pVX)) && this.#map.get(pixelXtoTileX(this.#map,this.#player.pX + this.#player.pVX + this.#map.tileSize[0]), this.#player.getY()) !== 0)
        // ) {
        //     this.#player.pX += (this.#player.pVX);
        // }
        // if (
        //     ((this.#player.pY > (this.#player.pY + this.#player.pVY)) && this.#map.get(this.#player.getX(), pixelYtoTileY(this.#map,this.#player.pY + this.#player.pVY)) !== 0) ||
        //     ((this.#player.pY < (this.#player.pY + this.#player.pVY)) && this.#map.get(this.#player.getX(), pixelYtoTileY(this.#map,this.#player.pY + this.#player.pVY + this.#map.tileSize[1])) !== 0)
        // ) {
        //     this.#player.pY += (this.#player.pVY);
        // }

        // if ((this.#player.pVX === 0 && this.#player.pVY === 0)) {
            // initialize camera
            // console.log(this.#player.pX + '', '-', this.#map.context.canvas.width+'', '/', '2','=', this.#map.camera.chaseX + '');
            // console.log(this.#player.pY + '', '-', this.#map.context.canvas.height+'', '/', '2','=', this.#map.camera.chaseY + '');
            // console.log('');
        // }

        // 1x1 pixel limited
        // this.#player.pX += (this.#player.pVX);
        // this.#player.pY += (this.#player.pVY);
        //
        // this.#player.pVX = 0;
        // this.#player.pVY = 0;
        //endregion

    }

    start() { this.loop(); }
    set bindPlayer(player) {this.#player = player;}
    set bindController(controller) {this.#keymap = controller;}



}

