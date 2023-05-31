// item.js
class Item {
  constructor(name, x, y, currentMapId, collectable, respawn, itemType, maxStack, quantity, itemLevel, minDamage, maxDamage, flavorText) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.currentMapId = currentMapId;
    this.collectable = collectable;
    this.respawn = respawn;
    this.itemType = itemType;
    this.maxStack = maxStack;
    this.quantity = quantity;
    this.itemLevel = itemLevel;
    this.minDamage = minDamage;
    this.maxDamage = maxDamage;
    this.flavorText = flavorText;
    this.img = img;











  }

  updateQuantity(newQuantity) {
    this.quantity = newQuantity;
    if (this.quantity <= 0 && this.maxStack !== null) {
      // Delete item or apply further logic when the consumable quantity reaches 0
    }
  }
}

module.exports = Item;