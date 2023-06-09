const data = [
    3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 100, 100, 3, 3, 100, 100, 100, 100, 100, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 100, 100, 3, 3, 100, 100, 100, 100, 100, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 100, 100, 3, 3, 100, 100, 100, 100, 100, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 100, 100, 3, 3, 100, 100, 100, 100, 100, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 100, 100, 100, 100, 100, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 100, 100, 100, 100, 100, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 10, 10,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 10, 10, 3, 10, 10, 10, 10, 10,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 10, 10, 3, 10, 10, 10, 10, 10,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 10, 10, 10, 3, 10, 10, 10, 10, 10,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
];

const width = 25;
const height = 19;

// Create 2D worldMap
let worldMap = [];
for (let y = 0; y < height; y++) {
  worldMap[y] = [];
  for (let x = 0; x < width; x++) {
    const moveCost = data[y * width + x];
    worldMap[y][x] = moveCost;
  }
}

module.exports = worldMap;