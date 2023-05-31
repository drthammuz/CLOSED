export default class ItemManager {
  constructor(scene, inventory) {
    this.scene = scene;
    this.inventory = inventory;
  }

  addToBackpack(item) {
    const emptySlotIndex = this.backpackItems.findIndex((slot) => slot === null);
    if (emptySlotIndex !== -1) {
      this.backpackItems[emptySlotIndex] = item;
    } else {
      console.log('Backpack is full!');
    }
    this.scene.events.emit('itemAddToBackpack', item);
    return emptySlotIndex;
  }

  getItemInfo(itemKey) {
    return this.getItemTooltipInfo(itemKey); // Use the same method for both on-ground and backpack tooltips
  }

  getItemTooltipInfo(itemSpawn) {

   // console.log(`Getting item tooltip info for: ${itemSpawn.name}`);
      
    return [
      { text: itemSpawn.name, color: '#9932CC', style: { fontStyle: 'bold' } },
      { text: `Item level ${itemSpawn.itemLevel}`, color: '#FFFFFF' },
      { text: itemSpawn.itemType, color: '#FFFFFF' },
      { text: `Damage: ${itemSpawn.minDamage}-${itemSpawn.maxDamage}`, color: '#FFFFFF' },
      { text: itemSpawn.flavorText, color: '#FFD700', style: { fontStyle: 'italic' } },
    ];
  }

}