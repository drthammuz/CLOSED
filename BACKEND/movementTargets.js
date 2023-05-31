class movementTargets {
    constructor(pathfinder, currentMapId, locomotion) {
        this.pathfinder = pathfinder;
        this.currentMapId = currentMapId;
        this.locomotion = locomotion;
    }

    async random(x, y, currentMapId, locomotion) {
      //  console.log("MovementTarget coordinates: ", x, y, currentMapId, locomotion);
        let newPath = null;
        let targetX;
        let targetY;

        while (newPath === null) {
            targetX = Math.floor(Math.random() * 1600);
            targetY = Math.floor(Math.random() * 800);
//console.log("MovementTarget coordinates: ", x, y, targetX, targetY, currentMapId, locomotion);

            newPath = await this.pathfinder.findPath(x, y, targetX, targetY, currentMapId, locomotion);
           // console.log("MovementTarget newPath: ", newPath);
        }
   //     console.log('targetX:', targetX, 'targetY;', targetY);
        return { newPath, targetX: targetX, targetY: targetY };
    }

    // TODO: Implement these methods based on your requirements
    // async flee() {
    // }

    // async chase() {
    // }

    // async patrol() {
    // }
}

module.exports = movementTargets;