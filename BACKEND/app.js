
const Item = require('./item');
const worldMap = require('./worldmap');
const spawnItems = require('./spawnItems');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const cors = require('cors'); 
const http = require('http');
const socketIO = require('socket.io');
const mysql = require('mysql2/promise');
const app = express();
const server = http.createServer(app);
const NPC = require('./npc');
const { gameWorld, initializeGameWorld } = require('./gameWorld');
const Movement = require('./movement');
const movement = new Movement();
const npc = new NPC();

const io = socketIO(server, {
  cors: {
    origin: 'http://zelda.panacean.it',
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: '*' }));


const dbConfig = {
  host: '135.181.158.154',
  port: 3306,
  user: 'thammuz',
  password: 'kanini',
  database: 'zelda',
};  
this.movement = Movement;
const connection = mysql.createPool(dbConfig);

  console.log('Connected to the MySQL server.');

  const spawnNPC = (gameWorld, x, y, targetX, targetY, speed, currentMapId, locomotion, brain, img) => {
    const id = uuidv4();
    const npc = new NPC(gameWorld, id, x, y, targetX, targetY, speed, currentMapId, locomotion, brain, img);
    gameWorld.npcs.push(npc);
    console.log('NPC spawned: id', id, 'x', x, 'y', y, 'targetX', targetX, 'targetY', targetY, 'speed', speed, 'map', currentMapId, 'locomotion', locomotion, brain, img);
    return npc;
};

spawnNPC(gameWorld, 100, 330, 0, 0, 2, '10-10', "MAMMAL", "goblin", 'goblin.png');

  //spawnNPC(200, 330, 0, 0, 0.8, '10-10', "MAMMAL", "goblin", 'goblin.png');
  //spawnNPC(100, 330, 0, 0, 0.5, '10-10', "FLYING", "goblin", 'link.png');


  const updateNPCs = () => {
    for (const npc of gameWorld.npcs) {
       // if (!npc.isIdle) {
        //    const targetTile = movement.moveSteps(); // call moveSteps() on the instance
            npc.main();
        }
        const npcInfo = npc.getInfo(gameWorld);
        io.emit('updateNPC', npcInfo);
    
};









  
initializeGameWorld(io);
  


io.on('connection', (socket) => {
  console.log('Client connected: ' + socket.id);
  
  socket.on('apa', () => {
     console.log('Received apa event');
     console.log(gameWorld.players);
  });




      socket.on('dropItem', (item) => {
        // Remove any existing items with the same ID
        gameWorld.items = gameWorld.items.filter(existingItem => existingItem.id !== item.item.id);
      
        // Add the new item
        gameWorld.items.push(item.item);
        console.log('gameWorld.items', gameWorld.items);
        io.emit('updateItems', gameWorld.items);
      });


      socket.on('requestworlditems', () => {
        console.log('Requesting world items...');
        console.log('gameworld unavailable', gameWorld.unavailableCharacters);
        console.log('gameworld players', gameWorld.players);
      });



      socket.on('requestMapItems', ({ mapId }) => {
        console.log(`Map items requested for mapId: ${mapId}`);
        // Filter the items that belong to the requested map
        const itemsForMap = gameWorld.items.filter(item => item.currentMapId === mapId);
        console.log(`Loaded ${itemsForMap.length} items from the game world for mapId: ${mapId}`, 'items:', itemsForMap);
        // Emit event for updating the map items
        io.emit('updateMapItems', { items: itemsForMap });
      });

      socket.on('pickupItem', ({ itemSpawn }) => {
        // Remove all items with the same ID
        gameWorld.items = gameWorld.items.filter(item => item.id !== itemSpawn.id);
        
        // Get all items that belong to the current map
        const itemsForMap = gameWorld.items.filter(item => item.currentMapId === itemSpawn.currentMapId);
        
        // Broadcast the updated items to all players on the same map
        socket.broadcast.to(itemSpawn.currentMapId).emit('updateMapItems', { items: itemsForMap });
        
        // Broadcast event to all other players on the same map
        io.emit('updateItems', gameWorld.items);
        console.log('Broadcasting itemPickedUp:', itemSpawn.id);
      });









socket.on('chatMessage', (message) => {
        console.log(`Chat message received from ${socket.id}: ${message}`);
        io.emit('chatMessage', message);
});


socket.on('buttons', async (id, callback) => {
  try {
    const [results] = await connection.query(
      'SELECT * FROM player_data WHERE id = ?',
      [id]
    );

    const characterData = results[0];
    const characterId = parseInt(characterData.id);
    const isAvailable = !gameWorld.unavailableCharacters.includes(id);

    if (Number.isInteger(characterId)) {
      callback({ success: true, characterData, isAvailable });
    } else {
      callback({ success: false });
    }
  } catch (err) {
    callback({ success: false });
  }
});

socket.on('requestOtherPlayers', (playerInfo) => {
  console.log("Requesting other players...");
  const otherPlayers = Object.values(gameWorld.players).filter(player => {
    //console.log("Comparing player.id:", player.id, "with playerInfo.id:", playerInfo.id);
    return player.id !== playerInfo.id;
  });

  console.log("Other players:", otherPlayers);

  otherPlayers.forEach(player => {
    socket.emit('newPlayer', player);
  });
});

socket.on('pingCheck', () => {
  // Update the player's last ping time
  if (gameWorld.players[socket.id]) {
    gameWorld.players[socket.id].lastPing = Date.now();
  }
});

socket.on('logout', (playerData, playerItems, playerId, playerMap) => {
  const playerName = playerData.name;
  if (playerData) {
    // Save player's position and map
    connection.query('UPDATE player_data SET x = ?, y = ?, map = ? WHERE id = ?',
      [playerData.x, playerData.y, playerMap, playerId], (err) => {
        if (err) {
          console.error('Error while updating player data:', err);
          throw err;
        }
    });
    
    // Save player's items
    console.log ('playerItems', playerItems);
    if (playerItems) { // Check if playerItems is not null or undefined
      console.log ('playerItems', playerItems);
      Object.entries(playerItems).forEach(([slot, item]) => {
        if (item === null) {
          console.log('Skipping over null item');
          return; // Skip over this iteration
        }
        console.log ('forEach item', item, 'logging item.id: ', item.id);
        connection.query('INSERT INTO player_items (id, player_id, player_name, item_name, slot, collectable, respawn, itemType, maxStack, quantity, itemLevel, minDamage, maxDamage, flavorText, img) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [item.id, playerId, playerName, item.name, slot, item.collectable, item.respawn, item.itemType, item.maxStack, item.quantity, item.itemLevel, item.minDamage, item.maxDamage, item.flavorText, item.img], (err) => {
            if (err) {
              console.error('Error while saving player items:', err);
              throw err;
            }
        });
      });
    }


    console.log (playerId, 'logging playerId');
    console.log (gameWorld.unavailableCharacters, 'logging gameWorld.unavailableCharacters');
    
    console.log ('playerData', playerData);
    console.log ('playerItems', playerItems);
    console.log ('playerId', playerId);
    const player = gameWorld.players[playerName];
    delete gameWorld.players[playerName];
    
    gameWorld.unavailableCharacters = gameWorld.unavailableCharacters.filter(characterId => String(characterId) !== String(playerId));
    
    socket.broadcast.emit('playerDisconnected', playerName);
    } else {
      console.log('Player not found in gameWorld');
    }
});




socket.on('getcharacterData', async (id, callback) => {
  try {
    const [results] = await connection.query(
      'SELECT * FROM player_data WHERE id = ?',
      [id]
    );

    const characterData = results[0];
    const characterId = parseInt(characterData.id);

    if (Number.isInteger(characterId)) {
      console.log(`Player connected: ${socket.id}`);
      callback({ success: true, characterData });
    
      // Register the player in gameWorld using character name as the key
      gameWorld.players[characterData.name] = {
        ...characterData,
        id: characterData.id,
        name: characterData.name,
      };

      socket.characterId = characterData.id;
      socket.emit('playerId', id);
    
      socket.broadcast.emit('newPlayer', gameWorld.players[characterData.name]);
      
    } else {
      callback({ success: false });
    }
  } catch (err) {
    callback({ success: false });
  }
});

socket.on('getCharacterItems', async (playerId, callback) => {
  try {
    const [items] = await connection.query(
      'SELECT * FROM player_items WHERE player_id = ?',
      [playerId]
    );
console.log ('XXX retrieved items from database: ', items);
    // Transform the items data into an object for easier access
    const playerItems = {};
    for (const item of items) {
      playerItems[item.slot] = item;
    }

    // Return the items to the client
    callback({ success: true, playerItems });

    // Delete the items from the database
    await connection.query(
      'DELETE FROM player_items WHERE player_id = ?',
      [playerId]
    );
  } catch (err) {
    callback({ success: false });
  }
});


socket.on('updateUnavailableCharacters', (id) => {
  gameWorld.unavailableCharacters.push(id);
});

socket.on('resetUnavailableCharacters', () => {
  gameWorld.unavailableCharacters = [];
});

socket.on('disconnect', () => {
  const player = gameWorld.players[socket.id];
  if (player) {
    connection.query('UPDATE player_data SET x = ?, y = ? WHERE id = ?',
      [player.x, player.y, player.id], (err) => {
        if (err) throw err;
      });
    delete gameWorld.players[socket.id];
    socket.broadcast.emit('playerDisconnected', socket.id);
  }
});

socket.on('playerMovement', (playerData) => {
  const player = gameWorld.players[playerData.name];
  if (player) {
      player.x = playerData.x;
      player.y = playerData.y;
      player.moving = playerData.moving;
      player.direction = playerData.direction;
      player.map = playerData.map;
      player.name = playerData.name;

      // Emit updated player movement data to all clients
      socket.broadcast.emit('playerMovement', player);
  } else {
      console.error('Player data not found:', playerData.name);

  }
}); // socket.on('playerMovement')



}); // io.on('connection')




// This function runs every 10 minutes (or however often you'd like to save the state of the game world)
setInterval(async () => {
  try {
    // Delete all items from item_data table
    await connection.query('TRUNCATE item_data');

    // Insert each item in gameWorld.items into item_data table
    for (const item of gameWorld.items) {
      await connection.query('INSERT INTO item_data SET ?', item);
    }
  } catch (err) {
    console.error('Error inserting item into item_data:', err);
  }
}, 600000); // 600000ms is 10 minutes

setInterval(updateNPCs, 30);

server.listen(5000, () => {
  console.log('Server is running on port 5000');
});
