export default class NPCpixie {
    constructor(gameScene, x, y, texture, map, depth) {
        this.gameScene = gameScene;
        this.sprite = this.gameScene.physics.add.image(x, y, texture);
      this.sprite = gameScene.physics.add.image(x, y, texture);
      this.currentMapId = map;
      this.isMoving = false;
      this.socket = io('http://135.181.158.154:5000');
    
      // Calculate scale factors
      let scaleX = 32 / this.sprite.width;
      let scaleY = 32 / this.sprite.height;
    
      // Scale the sprite
      this.sprite.setScale(scaleX, scaleY);
    
      this.sprite.setDepth(depth);
      this.sprite.setCollideWorldBounds(true);
  
      this.startX = x;
      this.startY = y;
      this.steps = 0;
      this.direction = 0; // 0 = not moving, -1 = left, 1 = right
      this.moveTimer = gameScene.time.addEvent({ delay: 5000, callback: this.decideMovement, callbackScope: this, loop: true });
  
      console.log("NPCpixie created at", x, y);
    }
  
    decideMovement() {
        // If not moving or already moving
        if (Math.random() < 0.5 || this.isMoving) {
          console.log("NPCpixie decided not to move or is already moving");
        } else {
          // Check if sprite is at an edge
          if (this.sprite.x <= this.startX - 64) {
            // On left edge, move right
            this.direction = 1;
          } else if (this.sprite.x >= this.startX + 64) {
            // On right edge, move left
            this.direction = -1;
          } else {
            // At center, randomly move left or right
            this.direction = Math.random() < 0.5 ? -1 : 1;
          }
          console.log("NPCpixie decided to move", this.direction === -1 ? "left" : "right");
          this.isMoving = true;
          this.gameScene.tweens.add({
            targets: this.sprite,
            x: this.sprite.x + this.direction * 32,
            duration: 1000, // 1 second duration
            ease: 'Linear',
            onComplete: () => { this.isMoving = false; this.direction = 0; }
          });
        }
      }

    destroy() {
        this.sprite.destroy();
        // Clean up any other resources, e.g., chatbot, if needed
      }

    update() {

}
}