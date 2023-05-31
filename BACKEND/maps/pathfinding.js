const worldMap = require('./worldmap.js');

function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

class Node {
    constructor(x, y, cost, heuristic, prev) {
        this.x = x;
        this.y = y;
        this.cost = cost;
        this.heuristic = heuristic;
        this.total = cost + heuristic;
        this.prev = prev;
    }
}

class Pathfinder {
    constructor(worldMap) {
        this.worldMap = worldMap;
    }
    findPath = function(startX, startY, endX, endY) {
    const startTileX = Math.floor(startX / 32);
    const startTileY = Math.floor(startY / 32);
    const targetTileX = Math.floor(endX / 32);
    const targetTileY = Math.floor(endY / 32);
    const straightCost = 1;
    const diagonalCost = Math.sqrt(2);
    let openList = [];
    let closedList = {};

    openList.push(new Node(startTileX, startTileY, 0, heuristic({x: startTileX, y: startTileY}, {x: targetTileX, y: targetTileY}), null));

    while (openList.length > 0) {
        let lowestIndex = 0;
        for (let i = 0; i < openList.length; i++) {
            if (openList[i].total < openList[lowestIndex].total) {
                lowestIndex = i;
            }
        }

        let currentNode = openList[lowestIndex];
        if (currentNode.x == targetTileX && currentNode.y == targetTileY) {
            let path = [];
            let tmpNode = currentNode;

            while (tmpNode !== null) {
                path.unshift({ x: tmpNode.x, y: tmpNode.y, cost: tmpNode.cost });
                tmpNode = tmpNode.prev;
            }

            let totalCost = path.reduce((sum, node) => sum + node.cost, 0);
           // console.log(`Path: ${JSON.stringify(path, null, 2)}, Total cost: ${totalCost}`);

            return path;
        }

        openList.splice(lowestIndex, 1);
        closedList[currentNode.x + "_" + currentNode.y] = currentNode;

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) {
                    continue;
                }
                let newX = currentNode.x + dx;
                let newY = currentNode.y + dy;

                if (newX < 0 || newY < 0 || newX >= worldMap[0].length || newY >= worldMap.length || worldMap[newY][newX] == 100) {
                    continue;
                }

                let movementCost = (Math.abs(dx) + Math.abs(dy) === 2) ? diagonalCost : straightCost;
                let newCost = currentNode.cost + movementCost * worldMap[newY][newX];
                let newHeuristic = heuristic({x: newX, y: newY}, {x: targetTileX, y: targetTileY});
                let totalCost = newCost + newHeuristic;

                if (closedList[newX + "_" + newY] && totalCost >= closedList[newX + "_" + newY].total) {
                    continue;
                }

                let existingNode = openList.find(n => n.x == newX && n.y == newY);

                if (!existingNode || totalCost < existingNode.total) {
                    if (existingNode) {
                        existingNode.cost = newCost;
                        existingNode.heuristic = newHeuristic;
                        existingNode.total = totalCost;
                        existingNode.prev = currentNode;
                    } else {
                        openList.push(new Node(newX, newY, newCost, newHeuristic, currentNode));
                    }
                }
            }
        }
    }

    return null;
}

}

module.exports = Pathfinder;