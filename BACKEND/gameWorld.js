const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2/promise');
const spawnItems = require('./spawnItems');

const gameWorld = {
    items: [],
    npcs: [],
    players: {},
    time: 'day',
    maps: {},
    unavailableCharacters: [],
    io: null,
    startGameLoop: function() {
        setInterval(() => {
            this.npcs.forEach((npc) => {
                npc.update(this);
            });
        }, 100);
    }
};

let connection;

const initializeGameWorld = async (io) => {
    try {
        gameWorld.io = io; 
        connection = await mysql.createConnection({
            host: '135.181.158.154',
            user: 'thammuz',
            password: 'kanini',
            database: 'zelda',
          });

        console.log('Connected to the MySQL server.');

        let [rows] = await connection.execute('SELECT * FROM item_data');
        rows.forEach(item => {
            gameWorld.items.push(item);
        });

        for (const item of spawnItems) {
            const existingItem = gameWorld.items.find(i => i.x === item.x && i.y === item.y && i.currentMapId === item.currentMapId);
            if (!existingItem) {
                const spawnedItem = {
                    id: uuidv4(),
                    name: item.name,
                    x: item.x,
                    y: item.y,
                    currentMapId: item.currentMapId,
                    collectable: item.collectable,
                    respawn: item.respawn,
                    itemType: item.itemType,
                    maxStack: item.maxStack,
                    quantity: item.quantity,
                    img: item.img,
                    itemLevel: item.itemLevel,
                    minDamage: item.minDamage,
                    maxDamage: item.maxDamage,
                    flavorText: item.flavorText,
                };
                gameWorld.items.push(spawnedItem);
            }
        }

        gameWorld.startGameLoop(io);

        console.log('Game World initialized successfully');
    } catch (err) {
        console.error('Error initializing Game World:', err);
    }
};

module.exports = {
    gameWorld,
    initializeGameWorld
};
