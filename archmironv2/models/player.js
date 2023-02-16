class Player {
    #map;

    constructor(map) {
        this.midX = map.tileSize[0] / 2;
        this.midY = map.tileSize[1] / 2;
        this.pVX = 0;
        this.pVY = 0;
        this.x = 0;
        this.y = 0;
        this.pX = (this.x * map.tileSize[0]) + this.midX;
        this.pY = (this.y * map.tileSize[1]) + this.midY;
        this.size = {
            width: 16,
            height: 16
        };
        this.#map = map;

        this.threshold = .5;
        this.decelerationRate = 0.90;
        this.decelerationTime = 0;
        this.initialVelocityX = 0;
        this.initialVelocityY = 0;
        this.initialValueX = 0;
        this.initialValueY = 0;
        this.endDurationX = 0;
        this.endDurationY = 0;
    }

    resetVelocityX() {this.pVX = 0;}
    resetVelocityY() {this.pVY = 0;}

    decelerate() {
        this.pVX *= this.decelerationRate;
        this.pVY *= this.decelerationRate;
    }

    destination(initialValue, initialVelocity) {
        return initialValue - initialVelocity / this.decelerationCoefficient;
    }

    valueByTime(initialValue, initialVelocity, time) {
        return initialValue + (Math.pow(this.decelerationRate, (1000 * time)) - 1) / this.decelerationCoefficient * initialVelocity;
    }

    duration(initialVelocity) {
        return Math.abs(Math.log(-(this.decelerationCoefficient) * this.threshold / initialVelocity) / this.decelerationCoefficient);
    }

    get decelerationCoefficient() {
        return 1000 * Math.log(this.decelerationRate);
    }

    destinationX() {return this.destination(this.pX, this.pVX);}
    destinationY() {return this.destination(this.pY, this.pVY);}

    endpointX() {return (this.pVX / 1000.0) * this.decelerationRate / (1.0 - this.decelerationRate)}
    endpointY() {return (this.pVY / 1000.0) * this.decelerationRate / (1.0 - this.decelerationRate)}

    hasCollision(obj) {
        return (
            this.getX() + this.size.width >= obj.x &&
            this.getX() <= obj.x + obj.width &&
            this.getY() <= obj.y + obj.height &&
            this.getY() + this.size.height >= obj.y
        )
    }


    getX() {return (this.pX - (this.pX % map.tileSize[0])) / map.tileSize[0];}
    getY() {return (this.pY - (this.pY % map.tileSize[1])) / map.tileSize[1];}
    update() {
        this.x = this.getX();
        this.y = this.getY();
    }
    draw() {
        this.#map.context.fillStyle = '#ff0000';
        this.#map.context.fillRect(Math.floor(this.pX), Math.floor(this.pY), this.#map.tileSize[0], this.#map.tileSize[1]);
    }
    setLocation(location) {
        if (isNaN(location.x) || isNaN(location.y)) throw 'x or y is not a number {setLocation}';
        this.x = location.x;
        this.y = location.y;
        this.updatePixelLocation();
    }
    resetCamera() {
        this.#map.camera.chaseX = this.pX - (this.#map.context.canvas.width / 2);
        this.#map.camera.chaseY = this.pY - (this.#map.context.canvas.height / 2);
        this.#map.camera.x = this.#map.camera.chaseX;
        this.#map.camera.y = this.#map.camera.chaseY;
    }
    updatePixelLocation() {
        if (isNaN(this.x) || isNaN(this.y)) throw 'x or y is not a number {updatePixelLocation}';
        this.pX = (this.x * map.tileSize[0]) + this.midX;
        this.pY = (this.y * map.tileSize[1]) + this.midY;
    }
    toString() {
        console.log(this.x, this.y, this.pX, this.pY, this.pVX, this.pVY);
    }

}