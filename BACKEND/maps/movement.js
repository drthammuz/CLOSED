const Pathfinder = require('./pathfinding');
const { loadSolidLayer } = require('./locomotion');
const { v4: uuidv4 } = require('uuid');

let solidLayer = loadSolidLayer('10-10.json');
const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;

class Movement {
    constructor(x, y, speed, worldMap) {
        this.id = uuidv4();
        this.x = x;
        this.y = y;
        this.speed = speed; 
        this.tileCoords = this.pixelToTileCoordinates(x, y);
        this.worldMap = worldMap;
        this.pathfinder = new Pathfinder(worldMap);
        this.path = [];
        this.direction = 'stop';
        this.lastX = this.x;
        this.lastY = this.y;
        this.solidLayer = loadSolidLayer('./maps/10-10.json');
    }

    pixelToTileCoordinates(x, y) {
        return { x: Math.floor(x / TILE_WIDTH), y: Math.floor(y / TILE_HEIGHT) };
    }

    tileToPixelCoordinates(x, y) {
        return { x: x * TILE_WIDTH, y: y * TILE_HEIGHT };
    }

    getRandomTarget() {
        let newPath = null;
        while (newPath === null) {
            this.targetX = Math.floor(Math.random() * 1600);
            this.targetY = Math.floor(Math.random() * 800);

            newPath = this.pathfinder.findPath(this.x, this.y, this.targetX, this.targetY, this.solidLayer);
        }
        this.setPath(newPath);
    }

    move() {
        let dx = 0;
        let dy = 0;
        console.log('solidLayer', solidLayer);
    
        if (this.path && this.path.length > 0) {
            const nextStep = this.path[0];  
            let targetCoords = this.tileToPixelCoordinates(nextStep.x, nextStep.y); 
    
            dx = targetCoords.x - this.x;  
            dy = targetCoords.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
    
            if (distance > this.speed) {
                dx /= distance;  
                dy /= distance;
    
                this.x += dx * this.speed;  
                this.y += dy * this.speed;
            } else {
                this.x = targetCoords.x;
                this.y = targetCoords.y;
                this.path.shift();  
            }
        }
    
        if(this.x === this.lastX && this.y === this.lastY) {
          this.direction = 'stop';
        } else {
          if(Math.abs(dx) > Math.abs(dy)) {
            this.direction = dx > 0 ? 'right' : 'left';
          } else {
            this.direction = dy > 0 ? 'down' : 'up';
          }
        }
        this.lastX = this.x;
        this.lastY = this.y;

        if (!this.path || this.path.length === 0) {
            this.getRandomTarget();
        } 
    }

    setPath(path) {
        this.path = path;
    }
}

module.exports = Movement;
