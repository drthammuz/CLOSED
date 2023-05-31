const Movement = require('./movement');
const Brain = require('./brain');
const { gameWorld } = require('./gameWorld');
const { initializeGameWorld } = require('./gameWorld');

class NPC {
    constructor(gameWorld, id, x, y, targetX, targetY, speed, currentMapId, locomotion, brainType, img) {
        this.movement = new Movement(id, x, y, targetX, targetY, speed, currentMapId, locomotion, brainType, img, gameWorld);
        this.targetX = targetX;
        this.targetY = targetY;
        this.targetTileCoords = this.movement.pixelToTileCoordinates(targetX, targetY);
        this.currentMapId = currentMapId;
        this.locomotion = locomotion;
        this.brain = new Brain(brainType, currentMapId, locomotion);
        this.img = img;
        this.gameWorld = gameWorld; // Passed from the spawnNPC function
    }

    

    
    main() {
      //  console.log('Moving NPC...');
     //   console.log('NPC locomotion:', this.locomotion);
      //  console.log('NPC currentMapId:', this.currentMapId);
        this.movement.main();
    console.log
        //const { x, y, id, direction, locomotion } = this.movement;
        //console.log(`NPC ${this.movement.id} moved to ${x}, ${y}`);
    }
    
    getInfo(gameWorld) {
        const { id, x, y, direction, img, locomotion, currentMapId, brainType } = this.movement;
        
       // console.log('Sending NPC info: ', 'this.movement.id', this.movement.id, 'this.movement.isAttacking', this.movement.isAttacking);
        
        return {
            id,
            x,
            y,
            direction,
            img,
            locomotion,
            currentMapId,
            brainType,
            isAttacking: this.movement.isAttacking, // Add this
            attackDirection: this.movement.attackDirection // Add this
        };
    }

    update(gameWorld) {
        this.main();
        this.distanceToClosestPlayer = this.movement.getClosestPlayerDistance();
    
        const data = {
            id: this.movement.id,
            x: this.movement.x,
            y: this.movement.y,
            direction: this.movement.direction,
            isAttacking: this.movement.isAttacking,
            attackDirection: this.movement.attackDirection,
            img: this.img,
            locomotion: this.locomotion,
            currentMapId: this.currentMapId,
            brainType: this.brain.brainType,
            distanceToClosestPlayer: this.distanceToClosestPlayer
        };
        gameWorld.io.to(this.currentMapId).emit('updateNPC', data);
    }
    
}

module.exports = NPC;


