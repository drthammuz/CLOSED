const fs = require('fs');

const TERRAINS = {
    'ROAD': [188, 165, 190, 121, 188, 149, 240],
    'GRASS': [0, 507, 508, 517, 518, 571, 540, 376, 380, 398, 375],
    'WATER': [385, 370, 489],
    'ROCK': [279, 280, 302, 303, 277, 278, 300, 301, 66, 90, 91, 69, 89, 92, 112, 109, 132, 110, 115, 156, 224, 180, 205, 157, 154, 155, 248, 225, 249]
};

const LOCOMOTIONS = {
    'FLYING': {
        'ROAD': 1,
        'GRASS': 1,
        'WATER': 1,
        'ROCK': 3
    },
    'MAMMAL': {
        'ROAD': 1,
        'GRASS': 3,
        'WATER': 10,
        'ROCK': 100
    },
    'SIGHT': {
        'ROAD': 1,
        'GRASS': 1,
        'WATER': 1,
        'ROCK': 10
    }
};

function convertTileToTerrain(tile) {   
    for (const [terrain, tiles] of Object.entries(TERRAINS)) {
        if (tiles.includes(tile)) {
            return terrain;
        }
    }
    throw new Error(`Unknown tile type: ${tile}`);
}

function convertTerrainToCost(terrain, locomotion) {
 //   console.log('locomotion:', locomotion);
   // console.log('LOCOMOTIONS[locomotion]:', LOCOMOTIONS[locomotion]);
    return LOCOMOTIONS[locomotion][terrain];
}

    function loadSolidLayer(mapId, locomotion) {
    if (typeof mapId !== 'string' || mapId.length === 0) {
        throw new Error('Invalid mapId provided. Please provide a non-empty string.');
    }
    //console.log('XXX mapId:', mapId, 'locomotion:', locomotion);
    let mapFilePath = mapId + '.json';
    let rawMapData = fs.readFileSync(mapFilePath);
    let mapData = JSON.parse(rawMapData);

    let solidLayerData;

    for (let layer of mapData.layers) {
        if (layer.name === 'solid') {
            solidLayerData = layer.data;
            break;
        }
    }

    if (!solidLayerData) {
        throw new Error(`No 'solid' layer found in map file ${mapFilePath}`);
    }

    // 'solidLayerData' is an array, so you might want to transform it into a 2D array for easier usage.
    let solidLayer2DData = [];
    for (let i = 0; i < mapData.height; i++) {
        let start = i * mapData.width;
        let end = start + mapData.width;
        let row = solidLayerData.slice(start, end).map(tile => convertTerrainToCost(convertTileToTerrain(tile), locomotion));
        solidLayer2DData.push(row);
    }

    return solidLayer2DData;
}

module.exports = { loadSolidLayer };