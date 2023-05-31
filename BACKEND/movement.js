const { Pathfinder } = require('./pathfinding');
const MovementTargets = require('./movementTargets');
const { v4: uuidv4 } = require('uuid');
const Brain = require('./brain');
const { gameWorld } = require('./gameWorld');

const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;


class Movement {
    constructor(id, x, y, targetX, targetY, speed, currentMapId, locomotion, brainType, img, gameWorld) {
      this.gameWorld = gameWorld;
                this.id = id;
                this.x = x;
                this.y = y;
                this.speed = speed; 
                this.tileCoords = this.pixelToTileCoordinates(x, y);
                this.pathfinder = new Pathfinder();
                this.path = [];
                this.direction = 'stop';
                this.lastX = this.x;
                this.lastY = this.y;
                this.targetX = targetX;
                this.targetY = targetY;
                this.currentMapId = currentMapId;
                this.locomotion = locomotion;
                this.brain = new Brain(brainType, currentMapId, locomotion);
                this.movementTargets = new MovementTargets(this.pathfinder, currentMapId, locomotion);
                this.img = img;
                this.gameWorld = gameWorld;
                this.isAttacking = false; 
                this.attackCooldown = 0;
                this.pathUpdateCooldown = 0; 
                this.brain.getTarget(this.x, this.y, gameWorld);
                this.brainType = brainType;
                this.distanceToClosestPlayer = null;
                this.hunger = this.getDefaultHunger(brainType);
                this.sleepy = this.getDefaultSleepiness(brainType);
                this.isIdle = true;  // The NPC is idle when first spawned
                this.frameCounter = 0;
                this.closestPlayer = 2; // default value
            }
        
          
                    // Default hunger level based on brain type
                    getDefaultHunger(brainType) {
                        // Add your default values based on the brain type
                        // Here is an example
                        switch(brainType) {
                            case 'goblin':
                                return 0;
                            case 'type2':
                                return 0;
                            default:
                                return 0;
                        }
                    }
                
                    // Default sleepiness level based on brain type
                    getDefaultSleepiness(brainType) {
                        // Add your default values based on the brain type
                        // Here is an example
                        switch(brainType) {
                            case 'goblin':
                                return 5;
                            case 'type2':
                                return 10;
                            default:
                                return 0;
                        }
                    }
                
                    async main() {
                        const { minDistance, closestPlayer } = await this.getClosestPlayerDistance();
               // console.log('minDistance before 2k', minDistance)
                        if(minDistance === null) {
                            this.minDistance = 1000;
                            return;
                        }
                console.log('this');
                        this.frameCounter++;
                        if(minDistance < 40) {
                            this.closestPlayer = 0;
                        } else if(minDistance >= 40 && minDistance <= 160) {
                            this.closestPlayer = 1;
                        } else {
                            this.closestPlayer = 2;
                        }
                       // console.log('closestPlayer', this.closestPlayer, minDistance);
                        switch (this.closestPlayer) {
                            case 0:
                                console.log('Attack!');
                               // this.attack();
                                break;
                            case 1:
                                if(this.frameCounter <= 2) {
                                    this.moveTo(this.target);
                                } else {
                                    this.frameCounter = 0;
                                    this.target = closestPlayer; // Assuming closestPlayer is a target object with {x, y} properties
                                    this.moveTo(this.target);
                                }
                                break;
                            case 2:
                                if(!this.target) {
                                    this.target = await this.movementTargets.random(this.x, this.y, this.currentMapId, this.locomotion);
                                }
                                this.moveTo(this.target);
                                break;
                            default:
                                break;
                        }
                    }

                    async moveSteps(path, steps) {
                        for (let i = 0; i < steps && i < path.length; i++) {
                            if (path[i]) {
                                await this.moveTo(path[i]);
                                this.target = this.nextTarget;
                            } else {
                                break;
                            }
                        }
                    }

                    moveTo(pathNode) {
                        // If there's no target, do nothing
                        if (!pathNode) {
                            return;
                        }

                        // Move the NPC towards the target
     const dx = pathNode.x - this.x;
    const dy = pathNode.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

                    
    if (distance < this.speed) {
        // If the NPC is close enough to the target, move them directly to the target
        this.x = pathNode.x;
        this.y = pathNode.y;
        this.isidle = true;
        this.main()
    } else {
        // Otherwise, move the NPC towards the target
        this.x += (dx / distance) * this.speed;
        this.y += (dy / distance) * this.speed;
    }
}

                    async chase(player) {
                        while (!this.isIdle) {
                            if (player) {
                                const path = await this.pathfinder.findPath(this.x, this.y, player.x, player.y, this.currentMapId, this.locomotion);
                                await this.moveSteps(path, 2);
                                await this.updatePlayerDistance();
                                        
                                if (this.distanceToClosestPlayer > 160) {
                                    this.isIdle = true;
                                } else if (this.distanceToClosestPlayer <= 40) {
                                    // Call attack method
                                    console.log ('Attack!');
                                }
                            } else {
                                this.isIdle = true;
                            }
                        }
                    }

                    async updatePlayerDistance() {
                        // We call 'getClosestPlayerDistance' directly from the gameWorld
                        this.distanceToClosestPlayer = this.getClosestPlayerDistance(this);
                    }
                    
               
                
                    // Method for searching food
                    async searchFood() {
                            const randomResult = await this.movementTargets.random(this.x, this.y, this.currentMapId, this.locomotion);
                            console.log('Hunting:', randomResult);
                            this.path = randomResult.newPath;
                        }
                
                    async searchSleepingPlace() {
                        const scanRange = 10; // Range of tiles to scan for sleeping place
                        const areaSize = 3; // Size of the area to consider for 'density' calculation
                    
                        let bestLocation = null;
                        let bestMoveCost = 0;
                    
                        for (let dx = -scanRange; dx <= scanRange; dx++) {
                            for (let dy = -scanRange; dy <= scanRange; dy++) {
                                const x = this.movement.x + dx;
                                const y = this.movement.y + dy;
                                const areaMoveCost = this.getAreaMoveCost(x, y, areaSize);
                                
                                if (areaMoveCost > bestMoveCost) {
                                    bestMoveCost = areaMoveCost;
                                    bestLocation = { x, y };
                                }
                            }
                        }
                    
                        if (bestLocation) {
                            // Move to the best location
                            const path = await this.pathfinder.findPath(this.movement.x, this.movement.y, bestLocation.x, bestLocation.y, this.currentMapId, this.locomotion);
                            await this.moveSteps(path, path.length);
                        }
                    }

                    getAreaMoveCost(x, y, areaSize) {
                        let totalMoveCost = 0;
                        for (let dx = -areaSize; dx <= areaSize; dx++) {
                            for (let dy = -areaSize; dy <= areaSize; dy++) {
                                const tileX = x + dx;
                                const tileY = y + dy;
                                const moveCost = this.locomotion.getTileMoveCost(tileX, tileY, this.currentMapId);
                                totalMoveCost += moveCost;
                            }
                        }
                        return totalMoveCost;
                    }

                    pixelToTileCoordinates(x, y) {
                        return { x: Math.floor(x / TILE_WIDTH), y: Math.floor(y / TILE_HEIGHT) };
                    }
                
                    tileToPixelCoordinates(x, y) {
                        return { x: x * TILE_WIDTH + TILE_WIDTH / 2, y: y * TILE_HEIGHT + TILE_HEIGHT / 2 };
                    }
                    getClosestPlayerDistance() {
                        let minDistance = null;
                        let closestPlayer = null;
                    
                        for(let playerId in this.gameWorld.players) { 
                            const player = this.gameWorld.players[playerId];
                            if(player.map === this.currentMapId) {
                                const dx = player.x - this.x;
                                const dy = player.y - this.y;
                                const distance = Math.sqrt(dx * dx + dy * dy);
                                if(minDistance === null || distance < minDistance) {
                                    minDistance = distance;
                                    closestPlayer = player;
                                }
                            }
                        }
                    
                        return {minDistance, closestPlayer};
                    }

                  
}

    module.exports = Movement;
                