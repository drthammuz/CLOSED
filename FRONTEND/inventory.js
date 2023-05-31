import Tooltip from './tooltip.js';
export default class InventoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'InventoryScene' });
    this.inventoryOpen = false; // initialize inventoryOpen as false
  }

  init(data) {
    this.socket = io('http://135.181.158.154:5000');
    this.player = data.player;
    this.inventoryOpen = true; // Set flag to true when the inventory is open
  }

  preload() {
    this.load.image('eq', 'eq.png');
    this.load.image('backpack', 'backpack.png');
    this.load.spritesheet('armor', 'armor.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('mastersword', 'mastersword.png');
  }

  findClosestSlot(x, y) {
    let closestSlot = null;
    let closestDistance = Infinity;
    for (const slotId in this.slots) {
      const slot = this.slots[slotId];
      const dx = slot.rect.x - x;
      const dy = slot.rect.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < closestDistance) {
        closestSlot = slot;
        closestDistance = distance;
      }
    }
    return closestSlot;
  }
  


  
  closeInventory() {
    this.inventoryOpen = false; // Set flag to false when closing the inventory
    const gameScene = this.scene.get('GameScene');
    gameScene.inventoryOpen = false; // Also update the flag in GameScene
    this.scene.wake('GameScene'); // Resume the GameScene
    this.scene.stop(); // Stop the InventoryScene
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    
    const background = this.add.rectangle(centerX, centerY, 700, 450, 0x111111, 0.8);
    background.setStrokeStyle(2, 0xffffff);
  
    const eq = this.add.image(centerX - 200, centerY + 0, 'eq');
    const backpack = this.add.image(centerX + 150, centerY + 0, 'backpack');

    this.input.keyboard.on('keydown-I', () => {
      this.closeInventory();
    });

    this.tooltip = new Tooltip(this, 0, 0);
    this.tooltip.setDepth(20000);
    this.slots = {};

    
this.slots['dropArea'] = {
  rect: new Phaser.Geom.Rectangle(this.game.config.width / 2 - 50, this.game.config.height / 2 - 50, 100, 100), // Change these values to move/resize the drop area
  item: null
};

this.add.graphics({ fillStyle: { color: 0x0000ff } }).fillRectShape(this.slots['dropArea'].rect);


    const slotPositions = [
      { x: centerX - 200, y: centerY + 120, id: 'Feet', tile: 10, itemType: 'Feet' },
      { x: centerX - 300, y: centerY - 20, id: 'Chest', tile: 7, itemType: 'Chest' },
      { x: centerX - 300, y: centerY + 20, id: 'Weapon', tile: 25, itemType: 'Weapon' },
      { x: centerX - 200, y: centerY - 120, id: 'Head', tile: 6, itemType: 'Head' },
      { x: centerX - 100, y: centerY - 20, id: 'Hands', tile: 13, itemType: 'Hands' },
      { x: centerX - 100, y: centerY + 20, id: 'Shield', tile: 24, itemType: 'Shield' },
      { x: centerX + 182, y: centerY - 16, id: 'bp1' },
      { x: centerX + 150, y: centerY - 16, id: 'bp2' },
      { x: centerX + 118, y: centerY - 16, id: 'bp3' },
      { x: centerX + 182, y: centerY + 16, id: 'bp4' },
      { x: centerX + 150, y: centerY + 16, id: 'bp5' },
      { x: centerX + 118, y: centerY + 16, id: 'bp6' },
    ];
    slotPositions.forEach((pos) => {
      const slot = this.add.rectangle(pos.x, pos.y, 32, 32, 0x999999);
      slot.setStrokeStyle(1, 0xffffff);
    
      if (pos.tile) {
        const armor = this.add.image(pos.x, pos.y, 'armor', pos.tile - 1);
        armor.setScale(0.5);
      }
      
      this.slots[pos.id] = { rect: slot, item: null, id: pos.id }; // now slots have both the rectangle, the item, and an id
    });

    this.input.on('pointerdown', (pointer) => {
      if (pointer.middleButtonDown()) {
console.log('playerItems', this.player.playerItems);

      }
    });




    this.refreshInventory(); // now refresh inventory after all slots are created
  }


  
  refreshInventory() {
    const playerItems = this.player.playerItems;
  
    for (const slotId in this.slots) {
      const item = playerItems[slotId];
      if (item) {
        const image = this.add.image(this.slots[slotId].rect.x, this.slots[slotId].rect.y, item.img);
        image.setScale(32 / image.width, 32 / image.height);
        this.slots[slotId].item = image; // store the item image in the slot
  
        // enable input events
        image.setInteractive();
  
        // drag-and-drop functionality
        this.input.setDraggable(image);
        

        image.on('pointerover', () => {
          this.tooltip.setDepth(100);
          const itemTooltipInfo = [
            { text: item.name, color: '#ffffff' }, 
            { text: item.name, color: '#9932CC', style: { fontStyle: 'bold' } },
            { text: `Item level ${item.itemLevel}`, color: '#FFFFFF' },
            { text: item.itemType, color: '#FFFFFF' },
            { text: `Damage: ${item.minDamage}-${item.maxDamage}`, color: '#FFFFFF' },
            { text: item.flavorText, color: '#FFD700', style: { fontStyle: 'italic' } },
          ];
          this.tooltip.updateText(itemTooltipInfo);
          this.tooltip.show(image.x, image.y - image.height / 2 - this.tooltip.height + 200);
        });
  
        image.on('pointerout', () => {
          this.tooltip.hide();
        });











        
        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
          gameObject.x = dragX;
          gameObject.y = dragY;
        });

        this.input.on('dragend', (pointer, gameObject) => {
        
          if (Phaser.Geom.Rectangle.ContainsRect(this.slots['dropArea'].rect, gameObject.getBounds())) {
            const originalSlot = Object.values(this.slots).find(slot => slot.item === gameObject);
            if (originalSlot) {
                // Save a reference to the item being dropped
                let item = this.player.playerItems[originalSlot.id];
                
                // Set the X and Y coordinates of the item to match the player's
                this.player.playerItems[originalSlot.id].x = this.player.x;
                this.player.playerItems[originalSlot.id].y = this.player.y;
                this.player.playerItems[originalSlot.id].currentMapId = this.player.currentMapId;
        
                this.socket.emit('dropItem', { item: item });
        
                // Remove the item game object from the slot
                originalSlot.item.destroy();
                originalSlot.item = null;
            
                // Remove the item data from playerItems
                delete this.player.playerItems[originalSlot.id];
            
            }
            return;
        }
        
          // If the item was not dropped in the drop area, handle inventory slot swapping
          const closestSlot = this.findClosestSlot(gameObject.x, gameObject.y);

          const originalSlotId = Object.values(this.slots).find(slot => slot.item === gameObject).id;
          const itemBeingDragged = this.player.playerItems[originalSlotId];
          
          // Move the item to the slot if it's close enough (adjust the distance as needed)
          if (
            closestSlot
            && Phaser.Math.Distance.Between(gameObject.x, gameObject.y, closestSlot.rect.x, closestSlot.rect.y) < 50
          ) {

            if (closestSlot.id.startsWith('bp') || itemBeingDragged.itemType === closestSlot.id) {
        
              gameObject.x = closestSlot.rect.x;
              gameObject.y = closestSlot.rect.y;
        
            // Swap items between the slots
            const previousSlot = Object.values(this.slots).find(slot => slot.item === gameObject);
            
            const tempItem = previousSlot.item;
            previousSlot.item = closestSlot.item;
            closestSlot.item = tempItem; 
        
            // Update player.playerItems
            const tempItemData = this.player.playerItems[previousSlot.id];
            this.player.playerItems[previousSlot.id] = this.player.playerItems[closestSlot.id];
            this.player.playerItems[closestSlot.id] = tempItemData;
            
            // If the slots swapped items, move the previous item to its new position
            if (previousSlot.item) {
              previousSlot.item.x = previousSlot.rect.x;
              previousSlot.item.y = previousSlot.rect.y;
            }
          } else {
            console.log(`Item type mismatch. The ${itemBeingDragged.itemType} cannot be placed in ${closestSlot.id} slot.`);
          }
          const originalSlot = Object.values(this.slots).find(slot => slot.item === gameObject);
          if (originalSlot) {
      
            gameObject.x = originalSlot.rect.x;
            gameObject.y = originalSlot.rect.y;

    }
  }
});
        
      }
    }
  }


  
  update() {

  }
}