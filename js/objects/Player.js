class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        // Add the player to the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Player properties
        this.isJumping = false;
        this.isDucking = false;
        this.isLeaning = false;
        this.balance = 100; // 0-100 balance meter
        
        // Set up physics body
        this.body.setSize(40, 90);
        this.body.setCollideWorldBounds(true);
        
        // Play idle animation
        this.play('idle');
    }
    
    jump() {
        if (this.isJumping || this.isDucking) return;
        
        this.isJumping = true;
        this.play('jump');
        
        // No balance reduction for jumping
        
        // Jump animation
        this.scene.tweens.add({
            targets: this,
            y: this.y - 120,
            duration: 500,
            ease: 'Power1',
            yoyo: true,
            onComplete: () => {
                this.isJumping = false;
                if (!this.isLeaning) {
                    this.play('idle');
                }
            }
        });
        
        return this.balance;
    }
    
    duck() {
        if (this.isJumping || this.isDucking) return;
        
        this.isDucking = true;
        this.play('duck');
        
        // No balance reduction for ducking
        
        // Duck animation - scale player down
        this.scene.tweens.add({
            targets: this,
            scaleY: 0.5,
            duration: 300,
            ease: 'Power1',
            hold: 300,
            yoyo: true,
            onComplete: () => {
                this.isDucking = false;
                if (!this.isLeaning) {
                    this.play('idle');
                }
            }
        });
        
        return this.balance;
    }
    
    leanLeft() {
        if (this.isDucking) return;
        
        this.isLeaning = true;
        this.play('lean_left');
        
        // Tilt the player to the left
        this.setAngle(-15);
        
        // Move slightly to the left
        this.x = 130;
        
        return this.balance;
    }
    
    leanRight() {
        if (this.isDucking) return;
        
        this.isLeaning = true;
        this.play('lean_right');
        
        // Tilt the player to the right
        this.setAngle(15);
        
        // Move slightly to the right
        this.x = 170;
        
        return this.balance;
    }
    
    stopLeaning() {
        if (this.isJumping || this.isDucking) return;
        
        this.isLeaning = false;
        this.play('idle');
        
        // Reset angle and position
        this.setAngle(0);
        this.x = 150;
    }
    
    updateBalance(delta) {
        // Only check if balance is too low, no automatic changes
        if (this.balance <= 0) {
            this.balance = 0;
            return false; // Indicates fall
        }
        
        return true; // Still balanced
    }
    
    applyRopeWobble(time, gameSpeed, maxGameSpeed) {
        if (this.isJumping) return;
        
        // Apply a sine wave to the y position to simulate rope wobble
        const wobbleSpeed = gameSpeed * 0.001;
        const wobbleAmount = 5 + (gameSpeed / maxGameSpeed) * 10;
        const wobble = Math.sin(time * wobbleSpeed) * wobbleAmount;
        
        this.y = (this.scene.sys.game.config.height / 2 - 48) + wobble;
    }
    
    fall() {
        this.play('fall');
        
        // Fall animation
        this.scene.tweens.add({
            targets: this,
            y: this.scene.sys.game.config.height + 100,
            angle: 180,
            duration: 1000,
            ease: 'Power1'
        });
    }
    
    getBalance() {
        return this.balance;
    }
}
