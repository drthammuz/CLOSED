

export default class Tooltip extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
      super(scene, x, y);
  
      this.scene = scene;
      this.background = null;
  
      this.textObjects = [];
      this.setVisible(false);
      this.scene.add.existing(this);
    }

    updateText(textArray) {
      // Destroy previous text objects
      this.textObjects.forEach((textObject) => {
        textObject.destroy();
      });
      this.textObjects = [];
    
      // If the background exists, remove and destroy it
      if (this.background) {
        this.remove(this.background);
        this.background.destroy();
      }
    
      let maxWidth = 0;
      let totalHeight = 0;
    
      textArray.forEach((textInfo, index) => {
        const fontStyle = index === 0 ? 'bold' : index === textArray.length - 1 ? 'italic' : 'normal';
        const tempTextObject = this.scene.add.text(0, 0, textInfo.text, { fontSize: '12px', color: textInfo.color, fontFamily: 'Roboto', fontStyle: fontStyle });
        maxWidth = Math.max(maxWidth, tempTextObject.width);
        totalHeight += tempTextObject.height;
        tempTextObject.destroy(); // We can destroy this temporary text object now
      });
    
      const fixedWidth = maxWidth;
    
      // Now we create the text objects for actual use
      let offsetY = 5;
      textArray.forEach((textInfo, index) => {
        const fontStyle = index === 0 ? 'bold' : index === textArray.length - 1 ? 'italic' : 'normal';
        const textObject = this.scene.add.text(0, 0, textInfo.text, { fontSize: '12px', color: textInfo.color, fontFamily: 'Roboto', fontStyle: fontStyle, wordWrap: { width: fixedWidth, useAdvancedWrap: true } });
        textObject.setPosition(5, offsetY);
        offsetY += textObject.height;
        this.textObjects.push(textObject);
        this.add(textObject);
      });
    
      // Create a new background with the updated dimensions
      this.background = this.scene.add.rectangle(0, 0, fixedWidth + 10, totalHeight + 10, 0x222222);
      this.background.setOrigin(0);
      this.add(this.background);
    
      // Move the background to the back of the tooltip
      this.sendToBack(this.background);
    }
  
    show(x, y) {
      this.setPosition(x, y - this.height);
      this.setVisible(true);
    }
  
    hide() {
      this.setVisible(false);
    }
  }
  