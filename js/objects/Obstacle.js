class Obstacle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        // Determine the texture based on obstacle type
        const textureKey = `obstacle${Phaser.Math.Between(1, 3)}`;
        super(scene, x, y, textureKey);
        
        // Add the obstacle to the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set obstacle type (low, high, side)
        this.obstacleType = type || this.determineType();
        
        // For side obstacles, determine which side
        if (this.obstacleType === 'side') {
            this.side = Phaser.Math.Between(0, 1) ? 'left' : 'right';
        }
        
        // Adjust position based on type
        this.adjustPosition();
        
        // Set physics properties
        this.body.setImmovable(true);
        this.body.setAllowGravity(false);
    }
    
    determineType() {
        const rand = Phaser.Math.Between(1, 3);
        switch (rand) {
            case 1: return 'low';   // Jump over
            case 2: return 'high';  // Duck under
            case 3: return 'side';  // Lean away from
            default: return 'low';
        }
    }
    
    adjustPosition() {
        // Adjust y position based on obstacle type
        switch (this.obstacleType) {
            case 'low':
                // No adjustment needed for low obstacles
                break;
            case 'high':
                // Move up for high obstacles
                this.y -= 40;
                break;
            case 'side':
                // Slight adjustment for side obstacles
                this.y -= 20;
                break;
        }
    }
    
    update(gameSpeed) {
        // Move obstacle based on game speed
        this.body.velocity.x = -gameSpeed;
        
        // Remove obstacle if it's off-screen
        if (this.x < -this.width) {
            this.destroy();
        }
    }
    
    getType() {
        return this.obstacleType;
    }
    
    getSide() {
        return this.side;
    }
}
