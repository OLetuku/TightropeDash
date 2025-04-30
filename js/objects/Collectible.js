class Collectible extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        // Determine the texture based on collectible type
        const textureKey = type || (Phaser.Math.Between(0, 1) === 0 ? 'hat' : 'baton');
        super(scene, x, y, textureKey);
        
        // Add the collectible to the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set collectible value based on type
        this.value = textureKey === 'hat' ? 10 : 20;
        
        // Set physics properties
        this.body.setAllowGravity(false);
        
        // Add spinning animation
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 1500,
            repeat: -1
        });
    }
    
    update(gameSpeed) {
        // Move collectible based on game speed
        this.body.velocity.x = -gameSpeed;
        
        // Remove collectible if it's off-screen
        if (this.x < -this.width) {
            this.destroy();
        }
    }
    
    getValue() {
        return this.value;
    }
}
