function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

class Node {
    constructor(x, y, cost, prev) {
        this.x = x;
        this.y = y;
        this.cost = cost;
        this.prev = prev;
    }
}

exports.findPath = function(startX, startY, endX, endY, worldMap) {
    let openList = [];
    let closedList = {};

    openList.push(new Node(startX, startY, 0, null));

    while (openList.length > 0) {
        // Find the node with the lowest cost in the open list
        let lowestIndex = 0;
        for (let i = 0; i < openList.length; i++) {
            if (openList[i].cost < openList[lowestIndex].cost) {
                lowestIndex = i;
            }
        }

        let currentNode = openList[lowestIndex];

        // If we reached the end, reconstruct the path and return it
        if (currentNode.x == endX && currentNode.y == endY) {
            let path = [];
            let tmpNode = currentNode;

            while (tmpNode !== null) {
                path.unshift({ x: tmpNode.x, y: tmpNode.y });
                tmpNode = tmpNode.prev;
            }

            return path;
        }

        // Move current node to the closed list
        openList.splice(lowestIndex, 1);
        closedList[currentNode.x + "_" + currentNode.y] = currentNode;

        // Check all neighboring nodes
        for (let dx = -5; dx <= 5; dx++) {
            for (let dy = -5; dy <= 5; dy++) {
                let newX = currentNode.x + dx;
                let newY = currentNode.y + dy;

                // Ignore the node if it is out of bounds or is a wall
                if (newX < 0 || newY < 0 || newX >= worldMap[0].length || newY >= worldMap.length || worldMap[newY][newX] == 100) {
                    continue;
                }

                let newCost = currentNode.cost + worldMap[newY][newX];

                // Ignore the node if it is already in the closed list and the new cost is higher than the current cost
                if (closedList[newX + "_" + newY] && newCost >= closedList[newX + "_" + newY].cost) {
                    continue;
                }

                // If the node is not in the open list or the new cost is lower than the current cost, update the node
                let existingNode = openList.find(n => n.x == newX && n.y == newY);

                if (!existingNode || newCost < existingNode.cost) {
                    if (existingNode) {
                        existingNode.cost = newCost;
                        existingNode.prev = currentNode;
                    } else {
                        openList.push(new Node(newX, newY, newCost, currentNode));
                    }
                }
            }
        }
    }

    // If we reached this point, there's no path to the end point
    return null;
}
