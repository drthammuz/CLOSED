const { Pathfinder } = require('./pathfinding');  // Assuming this is the correct import
const { gameWorld } = require('./gameWorld');

class Brain {
    constructor(brainType, currentMapId, locomotion) {
        this.brainType = brainType;
        this.currentMapId = currentMapId;
        this.locomotion = locomotion;
        this.pathfinder = new Pathfinder();  // Creating an instance of Pathfinder
        
    }

    async playersInRange(x, y, gameWorld) {
        if (gameWorld && gameWorld.players) {
            for (let playerName in gameWorld.players) {
                let player = gameWorld.players[playerName];
        //        console.log(`Player: ${player.name}, ${player.map}, ${player.x}, ${player.y}`);
         //       console.log(`Current: ${this.currentMapId}, ${x}, ${y}`);
                if (player.map === this.currentMapId) {
                    let path = await this.pathfinder.findPath(x, y, player.x, player.y, this.currentMapId, 'SIGHT');
                    if (path) {
                //        console.log(`Player found: ${player.name}`);
                  //      console.log(`Path length: ${path.length}`);
                        if (path.length <= 5) {
                            return player;
                        }
                    }
                }
            }
        }
        return null;
    }

    async getTarget(x, y, gameWorld) {
        if (this.brainType === "goblin") {
            return 'aggressive';
        } else {
            let player = await this.playersInRange(x, y, gameWorld);
            return player ? 'aggressive' : 'random';
        }
    }
}

module.exports = Brain;