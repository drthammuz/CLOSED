import InventoryScene from './inventory.js';
import NPC from './npcclient.js';
import ItemManager from './itemManagerClient.js';
import Tooltip from './tooltip.js';
import NPCpixie from './npcpixie.js';

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    if (data) {
      this.startX = data.x;
      this.startY = data.y;
      this.mapKey = data.mapKey;
      this.otherPlayers = this.physics.add.group();
      this.teleportGroup = this.physics.add.group();
    }
    this.itemData = {};
    this.socket = io('http://135.181.158.154:5000');
    this.player = null;
    this.npcs = new Map();
    this.otherPlayers = null;
    this.cursors = null;
    this.bakgrundLayer = null;
    this.dekorLayer = null;
    this.solidLayer = null;
    this.teleportGroup = null;
    this.playerSolidCollider = null;
    this.movementUpdateInterval = null;
    this.prevX = 0;
    this.prevY = 0;
    this.prevMoving = false;
    this.currentMapId = '10-10';
    this.loadedMaps = ['10-10', '11-10', '12-10'];
    this.inventory = new Array(14).fill(null);
    this.itemspawns = null;
    this.mapItems = [];
    this.itemLayer = this.add.layer();
    this.itemGroup = this.physics.add.group();

    this.enterTextBg = this.add.rectangle(490, 226, 230, 25, 0x000000);
    this.enterTextBg.alpha = 0.7;
    this.enterTextBg.setOrigin(0, 0);
    this.enterTextBg.setDepth(9);
    this.enterTextBg.setVisible(false);

    this.enterText = this.add.text(500, 226, "Press 'Space' to enter", { color: '#ffffff' });
    this.enterText.visible = false;
    this.enterText.setDepth(100);
  }
  



  createLogoutButton(scene, player, socket) {
    const logoutButton = scene.add.text(scene.cameras.main.width - 100, 10, 'Logout', {
      fontSize: '16px',
      fill: '#000',
    })
    .setDepth(1000);
  
    logoutButton.setInteractive({ useHandCursor: true });
  
    logoutButton.on('pointerdown', () => {
    //  const playerData = {
     //   playerData: this.player,
     //   playerId: this.player.playerId,
    //    name: this.player.name,
    //    x: this.player.x,
    //    y: this.player.y,
   //     currentMapId: this.player.currentMapId,
     // };
     console.log ('emitting this.player.id: ', this.player.id);
      socket.emit('logout', this.player, this.player.playerItems, this.player.playerId, this.player.currentMapId);
      scene.game.destroy(true);
      window.location.href = 'http://zelda.panacean.it';
    });
  
    //scene.cameras.main.uiContainer.add(logoutButton);
  }

  getNewMapId(currentMapId, direction) {
    const [levelX, levelY] = currentMapId.split('-').map(Number);

    if (isNaN(levelX) || isNaN(levelY)) {
    //  console.error('Invalid currentMapId format:', currentMapId);
    //  console.log('currentMapIdBefore: ', currentMapId);
      return currentMapId;
    }
    if (direction === 'right') {
      return `${levelX + 1}-${levelY}`;
    } else if (direction === 'left') {
      return `${levelX - 1}-${levelY}`;
    } else if (direction === 'up') {
      return `${levelX}-${levelY - 1}`;
    } else if (direction === 'down') {
      return `${levelX}-${levelY + 1}`;
    }
   // console.log('currentMapIdAfter: ', currentMapId);
    return currentMapId;
  }

  preload() {
   /// console.log('Entering preload function');
    this.load.spritesheet('player', 'players.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('ground', 'ground.png');
    this.load.image('tavern', 'tavern.png');
    this.load.image('armor.png', 'armor.png');
    this.load.image('link.png', 'link.png');
    this.load.tilemapTiledJSON('10-10', '10-10.json');
    this.load.tilemapTiledJSON('11-10', '11-10.json');
    this.load.tilemapTiledJSON('12-10', '12-10.json');
    this.load.tilemapTiledJSON('tavern', 'tavern.json');
    this.load.image('mastersword.png', 'mastersword.png');
    this.load.image('pixie', 'pixie.png');
    this.load.audio('botw', 'botw.mp3');
    this.load.audio('inn', 'Kakariko.mp3');
    //this.load.image('npc', 'link.png'); 
    this.load.spritesheet('npc', 'goblin.png', { frameWidth: 64, frameHeight: 64 });
  }

  

  handleTeleport(player, direction, targetMap = null, Xtobe = null, Ytobe = null) {
    //console.log('Teleporting player...');
    this.socket.emit('mapChange', { currentMapId: player.currentMapId });
    const mapKey = targetMap || this.getNewMapId(player.currentMapId, direction);
  //console.log('getting new mapkey: ', mapKey);
  //console.log('getting new player.currentMapId: ', player.currentMapId);
    let newX = player.x;
    let newY = player.y;

    if (direction === 'right') {
      newX = 4;
    } else if (direction === 'left') {
      newX = 800 - 32;
    } else if (direction === 'up') {
      newY = 600 - 32;
    } else if (direction === 'down') {
      newY = 4;
    }
    this.updateOtherPlayers(this.otherPlayers.getChildren());
    // Create the black overlay
    const blackOverlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    );
    blackOverlay.setDepth(10000);
    blackOverlay.alpha = 0;

    // Fade in the black overlay
    this.tweens.add({
      targets: blackOverlay,
      alpha: 1,
      duration: 450,
      onComplete: async () => {
        if (Xtobe !== null) {
          newX = Xtobe;
        }
        if (Ytobe !== null) {
          newY = Ytobe;
        }
        if (mapKey) {
          player.setPosition(newX, newY);
          player.currentMapId = mapKey;
          if (this.player.currentMapId === 'tavern') {
            this.pixie.sprite.setVisible(true);
            this.npcs.forEach((npc) => npc.sprite.visible = (npc.currentMapId === this.currentMapId));
          } else {
            this.pixie.sprite.setVisible(false);
            this.npcs.forEach((npc) => npc.sprite.visible = (npc.currentMapId === this.currentMapId));
          }
          this.sound.stopAll();
          if(mapKey === 'tavern'){
          //  this.sound.play('inn', { loop: true });

          }
          else
          {

        // this.sound.play('botw', { loop: true });  
          }
          


          this.loadNewMap(mapKey);
          this.socket.emit('requestMapItems', { mapId: this.player.currentMapId });
          this.tweens.add({
            targets: blackOverlay,
            alpha: 0,
            duration: 450,
            onComplete: () => {
              blackOverlay.destroy();
            },
          });
        } else {
console.log('mapKey is null');
        }
      },
    });
  }





  create() {


    const self = this;
    this.socket = socket;
    
   // console.log('characterData.map: ', characterData.map);
    const map = this.make.tilemap({ key: window.characterData.map });
    this.currentMapId = characterData.map;
    //const tileset = map.addTilesetImage('ground');
    let tilesetName = 'ground';
    if(this.currentMapId === 'tavern'){
      tilesetName = 'tavern';
    }
    const tileset = map.addTilesetImage(tilesetName);

    if(this.currentMapId === 'tavern'){
      this.tavernExitZone = this.add.zone(380, 416, 32, 32).setOrigin(0, 0);
      this.physics.world.enable(this.tavernExitZone);
    }

 //   console.log('map: ', map);
   // console.log('map.layerse: ', map.layers);
    this.bakgrundLayer = map.createLayer('bakgrund', tileset);
    this.bakgrundLayer.setDepth(1);
    this.bakgrundLayer.renderDebug = true;
    this.bakgrundLayer.alpha = 1;
  
    this.dekorLayer = map.createLayer('dekor', tileset);
    this.dekorLayer.setDepth(2);
    this.dekorLayer.renderDebug = true;
    this.dekorLayer.alpha = 1;
  
    this.solidLayer = map.createLayer('solid', tileset);
    this.solidLayer.setDepth(3);
    this.solidLayer.renderDebug = true;
    this.solidLayer.alpha = 1;
    if(this.currentMapId === 'tavern'){
   //   this.sound.play('inn', { loop: true });
    }else{
  //  this.sound.play('botw', { loop: true });
    }

    const teleportLayer = map.filterTiles(tile => tile.properties.teleport);

    this.createLogoutButton(this, this.player, this.socket);
    this.itemManager = new ItemManager(this);
    this.tooltip = new Tooltip(this, 0, 0);
    this.tooltip.setDepth(20000);

     //   this.player.inventory = window.characterData.playerItems;
    this.teleportGroup = this.physics.add.group();
    teleportLayer.forEach(tile => {
      const teleportTile = this.physics.add.sprite(tile.pixelX, tile.pixelY, 'ground', tile.index).setOrigin(0, 0);
      teleportTile.properties = tile.properties;
      teleportGroup.add(teleportTile);
    });

    this.player = this.physics.add.sprite(window.characterData.x, window.characterData.y, 'player');
    this.player.setOrigin(0, 0);
    this.player.currentMapId = window.characterData.map;
    this.player.name = window.characterData.name;
    this.player.playerId = window.characterData.id;
    this.otherPlayers = this.physics.add.group();
    this.player.setDepth(20);
    this.otherPlayers.setDepth(19);
    this.player.inventory = window.characterData.playerItems;
    this.itemManager = new ItemManager(this, this.inventory);
    
    let lastDirection = 'down';
    this.solidLayer.setCollisionByProperty({ collides: true });

    if (this.playerSolidCollider) {
      this.playerSolidCollider.destroy();
    }

    


    let lastAttackTime = {};
    const isInAttackAnimation = {};
    const isInPreAttackState = {};
    


    
      

        socket.on('updateNPC', (npcData) => {
          if (!this.npcs.has(npcData.id)) {
            const npc = new NPC(this, npcData.id, npcData.x, npcData.y);
            npc.lastNonStopDirection = npcData.direction;
            npc.directionCounter = 0;
            this.npcs.set(npcData.id, npc);
          }
        
          const npc = this.npcs.get(npcData.id);
        
          npc.moveTo(npcData.x, npcData.y, npcData.direction);
    
          if(npcData.direction !== 'stop') {
            if (npc.lastNonStopDirection === npcData.direction) {
              npc.directionCounter++;
            } else {
              npc.directionCounter = 1;
            }
            npc.lastNonStopDirection = npcData.direction;
          }
        
          if (npc.directionCounter >= 2) {
    
    
      if(!lastAttackTime[npc.id]) {
          lastAttackTime[npc.id] = 0;
      }
    
      if (!isInAttackAnimation[npc.id]) {
          isInAttackAnimation[npc.id] = false;
      }
    
      if (!isInPreAttackState[npc.id]) {
          isInPreAttackState[npc.id] = false;
      }
    
      let currentTime = new Date().getTime();
    
      if(npcData.isAttacking && !isInPreAttackState[npc.id] && currentTime - lastAttackTime[npc.id] >= 1200) {
          lastAttackTime[npc.id] = currentTime;
          isInAttackAnimation[npc.id] = true;
    
          setTimeout(() => {
              isInAttackAnimation[npc.id] = false;
          }, 1200);
    
          npc.sprite.anims.play(`goblin-attack-${npcData.attackDirection}`, true);
    
        } else if (npcData.isAttacking && !isInAttackAnimation[npc.id]) {
          isInPreAttackState[npc.id] = true;
    
          setTimeout(() => {
              isInPreAttackState[npc.id] = false;
          }, 500);
    
          npc.sprite.anims.play(`goblin-stand-${npcData.attackDirection || npcData.direction}`);
    
        } else if (npcData.direction === 'stop' && !isInAttackAnimation[npc.id] && !isInPreAttackState[npc.id]) {
          npc.sprite.anims.play(`goblin-stand-${npc.lastNonStopDirection}`);
    
        } else if (!isInAttackAnimation[npc.id] && !isInPreAttackState[npc.id]) {
          npc.sprite.anims.play(`goblin-walk-${npcData.direction}`, true);
      }}
    });
    


















    if (this.pixie) {
      pixie.destroy();
      this.pixie = null;
    }
    
    // Create Pixie no matter what.
    this.pixie = new NPCpixie(this, 390, 162, 'pixie', 'tavern', 10);
    
    // Set visibility based on the player's current map.
    if (this.player.currentMapId === 'tavern') {
      this.pixie.sprite.setVisible(true);
      this.npcs.forEach((npc) => npc.sprite.visible = (npc.currentMapId === this.currentMapId));
    } else {
      this.pixie.sprite.setVisible(false);
      this.npcs.forEach((npc) => npc.sprite.visible = (npc.currentMapId === this.currentMapId));
    }



    if (!window.characterData.playerItems) {
      window.characterData.playerItems = {};
    }

    socket.emit('requestMapItems', { mapId: this.player.currentMapId });
    socket.emit('requestOtherPlayers', { id: this.player.playerId });

    this.socket.on('updateItems', () => {
      this.socket.emit('requestMapItems', { mapId: this.player.currentMapId });
    });
    
    socket.emit('getCharacterItems', this.player.playerId, (response) => {
      if (response.success) {
        console.log('response.playerItems: ', response.playerItems);
    
        // List of all slots
        const slots = ['bp1', 'bp2', 'bp3', 'bp4', 'bp5', 'bp6', 'head', 'chest', 'hands', 'feet', 'weapon', 'shield'];
    
        this.player.playerItems = {};
        for (const slot of slots) {
          if (response.playerItems[slot]) {
            this.player.playerItems[slot] = response.playerItems[slot];
            this.events.emit('itemAddToBackpack', response.playerItems[slot]);
          } else {
            this.player.playerItems[slot] = null;
          }
        }
      } else {
        console.log('Error getting player items');
      }
    });
    this.innZone = this.add.zone(608, 256, 32, 32).setOrigin(0, 0);  // use correct size and set the origin
    this.physics.world.enable(this.innZone);
    
    this.tavernExitZone = this.add.zone(380, 416, 32, 32).setOrigin(0, 0);
    this.physics.world.enable(this.tavernExitZone);


    this.input.keyboard.on('keydown-I', () => {
      // Check whether inventory is already open before processing 'I' key input
      if (!this.inventoryOpen) {
        this.inventoryOpen = true; // Set flag to true when opening the inventory
        this.scene.launch('InventoryScene', { player: this.player }); // Launch InventoryScene and pass player data to it
      }
    });

    this.socket.on('updateMapItems', ({ items }) => {
      this.itemGroup.getChildren().forEach(function(child) { 
        child.destroy(); 
      });
      this.mapItems = [];
      items.forEach(item => {
        if (item.currentMapId === this.player.currentMapId) {
          this.createItems([item]); // wrap item in an array
        }
      });
    });

    this.input.on('pointerdown', (pointer) => {
      console.log('pointerdown triggered');
      if (pointer.middleButtonDown()) {
         console.log('middle button clicked');
         this.socket.emit('apa');
      }
   });

  //disable browser rightclick
  this.game.canvas.oncontextmenu = function (e) {
    e.preventDefault();
  };
  

    this.inventoryKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.inventoryVisible = false;
    this.inventoryScene = new InventoryScene();
    this.scene.add('InventoryScene', this.inventoryScene, false);

    this.currentMapId = this.getNewMapId(this.currentMapId, 'right');
    this.currentMapId = this.getNewMapId(this.currentMapId, 'left');
    this.currentMapId = this.getNewMapId(this.currentMapId, 'up');
    this.currentMapId = this.getNewMapId(this.currentMapId, 'down');

    const anims = this.anims;
    anims.create({
    key: 'left',
    frames: anims.generateFrameNumbers('player', { start: 12, end: 17 }),
    frameRate: 10,
    repeat: -1
    });
    anims.create({
    key: 'right',
    frames: anims.generateFrameNumbers('player', { start: 18, end: 23 }),
    frameRate: 10,
    repeat: -1
    });
    anims.create({
    key: 'down',
    frames: anims.generateFrameNumbers('player', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: -1
    });
    anims.create({
    key: 'up',
    frames: anims.generateFrameNumbers('player', { start: 6, end: 11 }),
    frameRate: 10,
    repeat: -1
    });
    anims.create({
    key: 'other-left',
    frames: anims.generateFrameNumbers('player', { start: 12, end: 17 }),
    frameRate: 10,
    repeat: -1
    });
    anims.create({
    key: 'other-right',
    frames: anims.generateFrameNumbers('player', { start: 18, end: 23 }),
    frameRate: 10,
    repeat: -1
    });
    anims.create({
    key: 'other-down',
    frames: anims.generateFrameNumbers('player', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: -1
    });
    anims.create({
    key: 'other-up',
    frames: anims.generateFrameNumbers('player', { start: 6, end: 11 }),
    frameRate: 10,
    repeat: -1
    });
    anims.create({
    key: 'attack-down',
    frames: anims.generateFrameNumbers('player', { start: 24, end: 29 }),
    frameRate: 10,
    repeat: -1
    });
    anims.create({
    key: 'attack-up',
    frames: anims.generateFrameNumbers('player', { start: 30, end: 35 }),
    frameRate: 10,
    repeat: -1
    });
    anims.create({
    key: 'attack-left',
    frames: anims.generateFrameNumbers('player', { start: 36, end: 41 }),
    frameRate: 10,
    repeat: -1
    });
    anims.create({
    key: 'attack-right',
    frames: anims.generateFrameNumbers('player', { start: 42, end: 47 }),
    frameRate: 10,
    repeat: -1
    });
    self.time.addEvent({
      delay: 1,
      callback: updateMovement,
      callbackScope: this,
      loop: true,
    });
    anims.create({
      key: 'goblin-walk-down',
      frames: this.anims.generateFrameNumbers('npc', { start: 0, end: 5, space: 1}),
      frameRate: 10,
      repeat: -1 // loop forever
  });
  anims.create({
    key: 'goblin-walk-right',
    frames: this.anims.generateFrameNumbers('npc', { start: 11, end: 16, space: 1 }),
    frameRate: 10,
    repeat: -1,
});
anims.create({
    key: 'goblin-walk-up',
    frames: this.anims.generateFrameNumbers('npc', { start: 22, end: 27, space: 1 }),
    frameRate: 10,
    repeat: -1, // loop forever
});
anims.create({
    key: 'goblin-walk-left',
    frames: this.anims.generateFrameNumbers('npc', { start: 33, end: 38, space: 1 }),
    frameRate: 10,
    repeat: -1,
});
anims.create({
  key: 'goblin-stand-down',
  frames: [{ key: 'npc', frame: 6 }],
  frameRate: 10,
});

anims.create({
  key: 'goblin-stand-left',
  frames: [{ key: 'npc', frame: 17 }],
  frameRate: 10,
});

anims.create({
  key: 'goblin-stand-up',
  frames: [{ key: 'npc', frame: 28 }],
  frameRate: 10,
});

anims.create({
  key: 'goblin-stand-right',
  frames: [{ key: 'npc', frame: 39 }],
  frameRate: 10,
});
anims.create({
  key: 'goblin-attack-down',
  frames: this.anims.generateFrameNumbers('npc', { start: 6, end: 10, space: 1}),
  frameRate: 10,

  });
  anims.create({
  key: 'goblin-attack-right',
  frames: this.anims.generateFrameNumbers('npc', { start: 17, end: 21, space: 1 }),
  frameRate: 10,

  });
  anims.create({
  key: 'goblin-attack-up',
  frames: this.anims.generateFrameNumbers('npc', { start: 28, end: 32, space: 1 }),
  frameRate: 10,

  });
  anims.create({
  key: 'goblin-attack-left',
  frames: this.anims.generateFrameNumbers('npc', { start: 39, end: 43, space: 1 }),
  frameRate: 10,

  });
//npc.sprite.anims.play('stand-down', true);

function updateMovement() {
  if (!self.player || !self.otherPlayers) {
    return;
  }
    
      const x = self.player.x;
      const y = self.player.y;
      let moving = false; // Define moving here
      if (self.cursors && self.cursors.left && self.cursors.right && self.cursors.up && self.cursors.down) {
        const moving = self.cursors.left.isDown || self.cursors.right.isDown || self.cursors.up.isDown || self.cursors.down.isDown;
      }
    
      if (x !== self.prevX || y !== self.prevY || moving !== self.prevMoving) {
        const deltaX = x - self.prevX;
        const deltaY = y - self.prevY;
        let direction = '';
    
        if (deltaX !== 0) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else if (deltaY !== 0) {
          direction = deltaY > 0 ? 'down' : 'up';
        }
    
        socket.emit('playerMovement', {
          x: x,
          y: y,
          direction: moving ? direction : '',
          moving: moving,
          map: self.player.currentMapId,
          name: self.player.name,
        });
    
        self.prevX = x;
        self.prevY = y;
        self.prevMoving = moving;
      }
    }
    

    this.playerSolidCollider = this.physics.add.collider(this.player, this.solidLayer, null, null, this);

    this.cursors = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };






      
    socket.on('newPlayer', (playerInfo) => {

      this.addOtherPlayer(playerInfo);
    });
    
    socket.on('playerId', (playerId) => {
      self.player.playerId = playerId;
    });
    
    socket.on('playerMovement', (playerInfo) => {
      // Find the otherPlayer object with the matching playerId
    
      const otherPlayer = self.otherPlayers.getChildren().find((op) => op.name === playerInfo.name);
    
      if (otherPlayer) {
    
        otherPlayer.x = playerInfo.x;
        otherPlayer.y = playerInfo.y;
        otherPlayer.currentMapId = playerInfo.map;
        otherPlayer.moving = playerInfo.moving;
        otherPlayer.direction = playerInfo.direction;
        if (self.player.currentMapId === otherPlayer.currentMapId) {
          otherPlayer.setVisible(true);
          self.updateOtherPlayers(self.otherPlayers.getChildren());
        } else {
          otherPlayer.setVisible(false);
        }
      }
    });
    




 




    
    socket.on('playerDisconnected', (playerId) => {
      self.otherPlayers.getChildren().forEach((otherPlayer) => {
        console.log(playerId, otherPlayer.name);
        if (playerId === otherPlayer.name) {
          otherPlayer.destroy();
        }
      });
    });
    
    self.time.addEvent({
      delay: 100,
      callback: updateVisibility,
      callbackScope: self,
      loop: true,
    });
    
    function updateVisibility() {
      if (!self.player || !self.otherPlayers) {
        return;
      }
    
      self.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (self.player.currentMapId === otherPlayer.currentMapId) {
          otherPlayer.setVisible(true);
        } else {
          otherPlayer.setVisible(false);
        }
      });
    }


    

    socket.on('currentPlayers', (players) => {
      Object.keys(players).forEach((playerId) => {
        if (playerId === socket.id) {
          return;
        }
        this.addOtherPlayer(players[playerId]);
      });
    });

  }  
  
  loadNewMap(newMapId) {
    // Create new map with given key
    const map = this.make.tilemap({ key: newMapId });
    this.currentMapId = newMapId;
    
    let tilesetName = 'ground';
    if (this.currentMapId === 'tavern') {
      tilesetName = 'tavern';
    }
    
    // Add tileset image based on map
    const tileset = map.addTilesetImage(tilesetName);
    
    if (this.currentMapId === 'tavern') {
      this.tavernExitZone = this.add.zone(380, 416, 32, 32).setOrigin(0, 0);
      this.physics.world.enable(this.tavernExitZone);
    }
    
    // Remove old collider before destroying old layers
    if (this.playerSolidCollider) {
      this.playerSolidCollider.destroy();
    }
  
    // Destroy old layers before creating new ones
    this.bakgrundLayer && this.bakgrundLayer.destroy();
    this.dekorLayer && this.dekorLayer.destroy();
    this.solidLayer && this.solidLayer.destroy();
  
    // Create new layers
    this.bakgrundLayer = map.createLayer('bakgrund', tileset);
    this.bakgrundLayer.setDepth(1);
    
    this.dekorLayer = map.createLayer('dekor', tileset);
    this.dekorLayer.setDepth(2);
    
    this.solidLayer = map.createLayer('solid', tileset);
    this.solidLayer.setDepth(3);
  
    // Adjust sound based on map
    if (this.currentMapId === 'tavern') {
   //   this.sound.play('inn', { loop: true });
    } else {
   //   this.sound.play('botw', { loop: true });
    }
  
    const teleportLayer = map.filterTiles(tile => tile.properties.teleport);
  
    // Clear teleportGroup before creating a new one
    this.teleportGroup.clear(true, true);
  
    teleportLayer.forEach(tile => {
      const teleportTile = this.physics.add.sprite(tile.pixelX, tile.pixelY, 'ground', tile.index).setOrigin(0, 0);
      teleportTile.properties = tile.properties;
      this.teleportGroup.add(teleportTile);
    });
    
    // Set collision by property for solid layer and create a new collider
    this.solidLayer.setCollisionByProperty({ collides: true });
    this.playerSolidCollider = this.physics.add.collider(this.player, this.solidLayer);
  }
  





  createItems(itemSpawns) {
    itemSpawns.forEach((itemSpawn) => {
      this.addItemSpawn(itemSpawn);
    });

  }




  addItemSpawn(itemSpawn) {
    this.mapItems.push(itemSpawn);
    const newItem = this.physics.add.sprite(itemSpawn.x, itemSpawn.y, itemSpawn.img);

    const scaleX = 32 / newItem.width;
    const scaleY = 32 / newItem.height;
    newItem.setScale(scaleX, scaleY);
    newItem.setInteractive({ hitArea: new Phaser.Geom.Rectangle(0, 0, newItem.width, newItem.height), hitAreaCallback: Phaser.Geom.Rectangle.Contains });
    this.itemGroup.add(newItem);
  
    newItem.setDepth(10);
    const itemTooltipInfo = this.itemManager.getItemTooltipInfo(itemSpawn);
        
    newItem.setInteractive({
      useHandCursor: true,
      hitArea: new Phaser.Geom.Rectangle(0, 0, 32, 32),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
    });

    Object.assign(newItem, itemSpawn);
    
    newItem.on('pointerover', () => {
      this.tooltip.setDepth(100);
      this.tooltip.updateText(itemTooltipInfo);
      this.tooltip.show(newItem.x, newItem.y);
    });
  
    newItem.on('pointerout', () => {
      this.tooltip.hide();
    });


        newItem.on('pointerdown', (pointer) => {
          if (pointer.leftButtonDown()) {

            
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, newItem.x, newItem.y);
            if (distance <= 50) {
              console.log('distance:', distance); 
              const backpackSlots = ['bp1', 'bp2', 'bp3', 'bp4', 'bp5', 'bp6'];
              let addedItem = false;
                  
              // Check if the item can be added to the backpack slots
              for (const slot of backpackSlots) {
              if (!this.player.playerItems[slot]) {
                this.player.playerItems[slot] = itemSpawn;
                addedItem = true;
                break;
                }
                }
                  
                if (!addedItem) {
                console.log('Backpack is full');
                }
                this.tooltip.setDepth(0);
                console.log('Emitting pickupItem:', itemSpawn);
                this.socket.emit('pickupItem', { itemSpawn });
                this.events.emit('itemAddToBackpack', itemSpawn);
                this.socket.emit('requestMapItems', { mapId: this.player.currentMapId });
                console.log('Logging this.player.currentMapId: ', this.player.currentMapId);
              } else {
              console.log('Player is too far from the item.');
              console.log('distance:', distance);
              }
        return      // This is where the closing bracket should be
    }  
        }
)};  
  













    update() {
      if (!this.player || !this.otherPlayers) {
        return;
      }
          
      if(this.pixie){
        this.pixie.update(this.currentMapId); // pass this.currentMapId as an argument
      }




    const edgeOverlap = 0.9 * 32;







    if (this.player.currentMapId === '10-10' && Phaser.Geom.Rectangle.Overlaps(this.player.getBounds(), this.innZone.getBounds())) {
      this.enterText.setVisible(true);
      this.enterTextBg.setVisible(true);
      
      if (this.cursors.space.isDown) {
        this.handleTeleport(this.player, null, 'tavern', 380, 416);
      }
    } else {
      this.enterText.setVisible(false);
      this.enterTextBg.setVisible(false);
    }
    
    if (this.player.currentMapId === 'tavern' && Phaser.Geom.Rectangle.Overlaps(this.player.getBounds(), this.tavernExitZone.getBounds())) {
      if (this.cursors.space.isDown) {
        this.handleTeleport(this.player, null, '10-10', 608, 256);
      }
    }


    const directions = ['left', 'right', 'up', 'down'];
    for (const direction of directions) {
      let newMapId = this.getNewMapId(this.player.currentMapId, direction);

      if (this.loadedMaps.includes(newMapId)) {
        let shouldTeleport = false;

        if (direction === 'left' && this.player.x <= 32 - edgeOverlap) {
          shouldTeleport = true;
        } else if (direction === 'right' && this.player.x >= 800 - edgeOverlap) {
          shouldTeleport = true;
        } else if (direction === 'up' && this.player.y <= 32 - edgeOverlap) {
          shouldTeleport = true;
        } else if (direction === 'down' && this.player.y >= 600 - edgeOverlap) {
          shouldTeleport = true;
        }

        if (shouldTeleport) {
          this.handleTeleport(this.player, direction);
          break;
        }
      }
    }
    this.updateOtherPlayers(this.otherPlayers.getChildren());

    // Movement logic for own player
    const speed = 100;
    this.player.body.setVelocity(0);
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
    }
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
    }
    if (this.cursors.left.isDown) {
      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.anims.play('right', true);
    } else if (this.cursors.up.isDown) {
      this.player.anims.play('up', true);
    } else if (this.cursors.down.isDown) {
      this.player.anims.play('down', true);
    } else {
    this.player.anims.stop();
    // If we were moving, pick and idle frame to use
    if (this.prevMoving) {
      this.player.setTexture('player', this.getIdleFrame(this.player.anims.currentAnim.key));
    }
    }
    }
      ////////////////////////////////////////////////////  

    updateOtherPlayers(players) {
    Object.values(players).forEach((otherPlayer) => {
      // Check if the other player is moving and set the corresponding animation
      if (otherPlayer.moving) {
     //   console.log('otherPlayer.moving:', otherPlayer.moving, otherPlayer.direction);
        const animationKey = 'other-' + otherPlayer.direction;
        if (animationKey === 'other-') {
          otherPlayer.anims.stop();
        } else {
          otherPlayer.anims.play(animationKey, true);
        }
      } else {
        otherPlayer.anims.stop();
      }
    });
  }


  getIdleFrame(currentAnimKey) {
    let idleFrame = 0;

    switch (currentAnimKey) {
      case 'left':
        idleFrame = 1;
        break;
      case 'right':
        idleFrame = 2;
        break;
      case 'up':
        idleFrame = 3;
        break;
      case 'down':
        idleFrame = 0;
        break;
    }

    return idleFrame;
  }

  addOtherPlayer(playerInfo) {
    //console.log('this.otherPlayers:', this.otherPlayers);
    if (!this.otherPlayers) {
      this.otherPlayers = this.physics.add.group();
    }
  // console.log('Trying to add other player:', playerInfo, 'karta:', playerInfo.map, 'oid:', playerInfo.id, 'sid:', player.id);
  const otherPlayer = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'player');
    otherPlayer.setOrigin(0, 0);
    otherPlayer.setTint(playerInfo.color);
    this.otherPlayers.add(otherPlayer);
    otherPlayer.name = playerInfo.name;
    otherPlayer.currentMapId = playerInfo.map; // Add this line to set the currentMapId property
   // console.log('otherPlayer.currentMapId:', otherPlayer.currentMapId, 'playerInfo.currentMapId:', playerInfo.map);
    otherPlayer.setDepth(19); // Add this line to set an explicit depth value

    // Set the initial visibility of the other player to false
    otherPlayer.setVisible(false);

    otherPlayer.setInteractive();
    otherPlayer.on('pointerdown', function (pointer) {
      console.log('Clicked Player ID:', this.name);
      console.log('currentMapId:', this.currentMapId);
    });
  }


  displayStats() {
    console.log('--- Player Information ---');
    console.log(`Own Player (You) - ID: ${player.name}, Map ID: ${player.currentMapId}, sifferid: ${player.playerId}`);
    otherPlayers.getChildren().forEach((otherPlayer) => {
      console.log(`Player ID: ${otherPlayer.name}, x: ${otherPlayer.x},Map ID: ${otherPlayer.currentMapId}`);
    });
    console.log('--------------------------');
  }
}
export { GameScene };

  