class NPC {
  constructor(scene, id, x, y) {
      this.scene = scene;
      this.id = id;
      this.isAttacking = false;
      this.attackDirection = 'down';
      this.direction = 'down';
      this.sprite = scene.physics.add.sprite(x, y, 'npc').setScale(1);
      this.sprite.setDepth(11);
      this.currentMapId = this.currentMapId;
      console.log(`Created NPC sprite with ID: ${this.id} at position ${x}, ${y}`);
  }

  moveTo(x, y, direction) {
      this.direction = direction;

      // Move sprite to the new position
      this.sprite.x = x + 16;
      this.sprite.y = y ;

      if (this.direction !== 'stop') {
          this.lastNonStopDirection = this.direction;
      }
  }
}
export default NPC;