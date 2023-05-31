const Movement = require('./movement');
class NPC {
    constructor(id, x, y, targetX, targetY, speed, currentMapId) {
        this.movement = new Movement(x, y, speed, currentMapId);
        this.targetX = targetX;
        this.targetY = targetY;
        this.targetTileCoords = this.movement.pixelToTileCoordinates(targetX, targetY);
        this.currentMapId = currentMapId;
        this.id = id;
    }

    move() {
        this.movement.move();
        const { x, y } = this.movement;
        //console.log(`NPC ${this.movement.id} moved to ${x}, ${y}`);
    }
    
    getInfo() {
        console.log('this.movement.id', this.movement.id);
        console.log('this.id', this.id);
        return {

            id: this.id,
            x: this.movement.x,
            y: this.movement.y,
            direction: this.movement.direction,
            currentMapId: this.currentMapId
            // Include any other properties you want to send
        };
    }
}

module.exports = NPC;