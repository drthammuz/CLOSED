class Brain {
  constructor(name, movementPattern) {
    this.name = name;
    this.movementPattern = movementPattern;
  }

  patrol(npc) {
    // Implementation of patrol behavior.
    // For now, let's make the NPC move in a simple square pattern.
    // We'll use a state variable to keep track of which direction the NPC is currently moving.
    if (!this.patrolDirection) {
      this.patrolDirection = 'right';
    }
    switch (this.patrolDirection) {
      case 'right':
        npc.x += npc.speed;
        if (npc.x >= npc.targetX) {
          this.patrolDirection = 'down';
        }
        break;
      case 'down':
        npc.y += npc.speed;
        if (npc.y >= npc.targetY) {
          this.patrolDirection = 'left';
        }
        break;
      case 'left':
        npc.x -= npc.speed;
        if (npc.x <= npc.targetX) {
          this.patrolDirection = 'up';
        }
        break;
      case 'up':
        npc.y -= npc.speed;
        if (npc.y <= npc.targetY) {
          this.patrolDirection = 'right';
        }
        break;
    }
  }

  aa(npc) {
    // Implementation of A* algorithm.
    // This is basically a wrapper around the existing NPC move method.
    npc.move();
  }
}
