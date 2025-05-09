class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init() {
        // Game variables
        this.score = 0;
        this.lives = 3;
        this.gameSpeed = 300;
        this.maxGameSpeed = 600;
        this.speedIncreaseInterval = 10000; // 10 seconds
        this.lastSpeedIncrease = 0;
        this.balance = 100; // 0-100 balance meter (only changes on events, not over time)
        this.isGameOver = false;
        
        // Track player state
        this.isJumping = false;
        this.isDucking = false;
        this.isLeaning = false;
    }

    create() {
        // Set up background
        this.background = this.add.tileSprite(0, 0, this.sys.game.config.width, this.sys.game.config.height, 'background')
            .setOrigin(0)
            .setTint(0xffb6c1); // Pink tint matching the website
        
        // Create the rope
        this.rope = this.add.tileSprite(
            0, 
            this.sys.game.config.height / 2, 
            this.sys.game.config.width, 
            20, 
            'rope'
        ).setOrigin(0, 0.5);
        
        // Create player
        this.player = this.physics.add.sprite(
            150, 
            this.sys.game.config.height / 2 - 48, 
            'player'
        ).setOrigin(0.5, 1);
        
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(40, 90); // Adjust hitbox
        this.player.play('idle');
        
        // Set up groups for obstacles and collectibles
        this.obstacles = this.physics.add.group();
        this.collectibles = this.physics.add.group();
        
        // Set up collisions
        this.physics.add.overlap(
            this.player, 
            this.obstacles, 
            this.hitObstacle, 
            null, 
            this
        );
        
        this.physics.add.overlap(
            this.player, 
            this.collectibles, 
            this.collectItem, 
            null, 
            this
        );
        
        // Set up UI
        this.createUI();
        
        // Set up swipe detector
        this.swipeDetector = new SwipeDetector(this);
        
        // Start spawning obstacles and collectibles
        this.obstacleTimer = this.time.addEvent({
            delay: 2000,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });
        
        this.collectibleTimer = this.time.addEvent({
            delay: 3000,
            callback: this.spawnCollectible,
            callbackScope: this,
            loop: true
        });
        
        // Start background music
        this.music = this.sound.add('music', { loop: true, volume: 0.5 });
        this.music.play();
        
        // Sound effects
        this.jumpSound = this.sound.add('jump', { volume: 0.5 });
        this.collectSound = this.sound.add('collect', { volume: 0.5 });
        this.hitSound = this.sound.add('hit', { volume: 0.5 });
        this.fallSound = this.sound.add('fall', { volume: 0.7 });
    }

    update(time, delta) {
        if (this.isGameOver) return;
        
        // Move background and rope
        this.background.tilePositionX += this.gameSpeed * delta / 1000;
        this.rope.tilePositionX += this.gameSpeed * delta / 1000;
        
        // Apply rope wobble effect to player
        if (!this.isJumping) {
            const wobbleSpeed = this.gameSpeed * 0.001;
            const wobbleAmount = 5 + (this.gameSpeed / this.maxGameSpeed) * 10;
            const wobble = Math.sin(time * wobbleSpeed) * wobbleAmount;
            this.player.y = (this.sys.game.config.height / 2 - 48) + wobble;
        }
        
        // Increase game speed over time
        if (time > this.lastSpeedIncrease + this.speedIncreaseInterval) {
            this.increaseSpeed();
            this.lastSpeedIncrease = time;
        }
        
        // Check if balance is too low
        if (this.balance <= 0) {
            this.balance = 0;
            this.fallOffRope();
        }
        
        // Update balance meter UI
        this.updateBalanceMeter();
        
        // Update obstacles and collectibles
        this.updateObstacles(delta);
        this.updateCollectibles(delta);
        
        // Handle keyboard input for testing
        this.handleKeyboardInput();
    }
    
    createUI() {
        // Score text
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            font: '24px Arial',
            fill: '#e25822' // Orange color matching the website
        });
        
        // Lives display
        this.livesGroup = this.add.group();
        for (let i = 0; i < this.lives; i++) {
            const heart = this.add.image(
                this.sys.game.config.width - 30 - (i * 35), 
                30, 
                'heart'
            ).setScale(0.5);
            this.livesGroup.add(heart);
        }
        
        // Balance meter background
        this.balanceMeterBg = this.add.rectangle(
            this.sys.game.config.width / 2,
            30,
            200,
            20,
            0x000000,
            0.3
        ).setOrigin(0.5);
        
        // Balance meter fill
        this.balanceMeterFill = this.add.rectangle(
            this.sys.game.config.width / 2 - 100,
            30,
            200,
            20,
            0xe25822 // Orange color
        ).setOrigin(0, 0.5);
        
        // Balance meter text
        this.add.text(
            this.sys.game.config.width / 2,
            55,
            'Balance',
            {
                font: '16px Arial',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
    }
    
    updateBalanceMeter() {
        // Update balance meter fill width based on balance value (0-100)
        this.balanceMeterFill.width = this.balance * 2;
        
        // Change color based on balance level
        if (this.balance < 30) {
            this.balanceMeterFill.fillColor = 0xff0000; // Red
        } else if (this.balance < 60) {
            this.balanceMeterFill.fillColor = 0xffff00; // Yellow
        } else {
            this.balanceMeterFill.fillColor = 0x00ff00; // Green
        }
    }
    
    spawnObstacle() {
        if (this.isGameOver) return;
        
        // Randomly select obstacle type
        const obstacleType = Phaser.Math.Between(1, 3);
        const obstacleName = `obstacle${obstacleType}`;
        
        // Create obstacle at the right edge of the screen
        const obstacle = this.obstacles.create(
            this.sys.game.config.width + 100,
            this.sys.game.config.height / 2 - 30,
            obstacleName
        );
        
        // Set obstacle properties based on type
        switch (obstacleType) {
            case 1: // Low obstacle (jump over)
                obstacle.setData('type', 'low');
                break;
            case 2: // High obstacle (duck under)
                obstacle.setData('type', 'high');
                obstacle.y -= 40;
                break;
            case 3: // Side obstacle (lean away from)
                obstacle.setData('type', 'side');
                obstacle.y -= 20;
                // Randomly place on left or right side
                obstacle.setData('side', Phaser.Math.Between(0, 1) ? 'left' : 'right');
                break;
        }
        
        // Set physics properties
        obstacle.setImmovable(true);
        obstacle.body.setAllowGravity(false);
        obstacle.body.velocity.x = -this.gameSpeed;
    }
    
    updateObstacles(delta) {
        this.obstacles.getChildren().forEach(obstacle => {
            // Update velocity based on current game speed
            obstacle.body.velocity.x = -this.gameSpeed;
            
            // Remove obstacles that have gone off screen
            if (obstacle.x < -obstacle.width) {
                obstacle.destroy();
            }
        });
    }
    
    spawnCollectible() {
        if (this.isGameOver) return;
        
        // Randomly select collectible type
        const collectibleType = Phaser.Math.Between(0, 1);
        const collectibleName = collectibleType === 0 ? 'hat' : 'baton';
        
        // Create collectible at the right edge of the screen
        const collectible = this.collectibles.create(
            this.sys.game.config.width + 100,
            this.sys.game.config.height / 2 - 50 - Phaser.Math.Between(-30, 30),
            collectibleName
        );
        
        // Set collectible properties
        collectible.setData('value', collectibleType === 0 ? 10 : 20);
        
        // Set physics properties
        collectible.body.setAllowGravity(false);
        collectible.body.velocity.x = -this.gameSpeed;
        
        // Add a spinning animation
        this.tweens.add({
            targets: collectible,
            angle: 360,
            duration: 1500,
            repeat: -1
        });
    }
    
    updateCollectibles(delta) {
        this.collectibles.getChildren().forEach(collectible => {
            // Update velocity based on current game speed
            collectible.body.velocity.x = -this.gameSpeed;
            
            // Remove collectibles that have gone off screen
            if (collectible.x < -collectible.width) {
                collectible.destroy();
            }
        });
    }
    
    handleKeyboardInput() {
        const cursors = this.input.keyboard.createCursorKeys();
        
        if (cursors.up.isDown && !this.isJumping && !this.isDucking) {
            this.jump();
        }
        
        if (cursors.down.isDown && !this.isJumping && !this.isDucking) {
            this.duck();
        }
        
        if (cursors.left.isDown && !this.isJumping) {
            this.leanLeft();
        } else if (cursors.right.isDown && !this.isJumping) {
            this.leanRight();
        } else {
            this.stopLeaning();
        }
    }
    
    // Player actions
    jump() {
        if (this.isJumping || this.isDucking) return;
        
        this.isJumping = true;
        this.player.play('jump');
        this.jumpSound.play();
        
        // No balance reduction for jumping
        
        // Jump animation
        this.tweens.add({
            targets: this.player,
            y: this.player.y - 120,
            duration: 500,
            ease: 'Power1',
            yoyo: true,
            onComplete: () => {
                this.isJumping = false;
                if (!this.isLeaning) {
                    this.player.play('idle');
                }
            }
        });
    }
    
    duck() {
        if (this.isJumping || this.isDucking) return;
        
        this.isDucking = true;
        this.player.play('duck');
        
        // No balance reduction for ducking
        
        // Duck animation - scale player down
        this.tweens.add({
            targets: this.player,
            scaleY: 0.5,
            duration: 300,
            ease: 'Power1',
            hold: 300,
            yoyo: true,
            onComplete: () => {
                this.isDucking = false;
                if (!this.isLeaning) {
                    this.player.play('idle');
                }
            }
        });
    }
    
    leanLeft() {
        if (this.isDucking) return;
        
        this.isLeaning = true;
        this.player.play('lean_left');
        
        // Tilt the player to the left
        this.player.setAngle(-15);
        
        // Move slightly to the left
        this.player.x = 130;
    }
    
    leanRight() {
        if (this.isDucking) return;
        
        this.isLeaning = true;
        this.player.play('lean_right');
        
        // Tilt the player to the right
        this.player.setAngle(15);
        
        // Move slightly to the right
        this.player.x = 170;
    }
    
    stopLeaning() {
        if (this.isJumping || this.isDucking) return;
        
        this.isLeaning = false;
        this.player.play('idle');
        
        // Reset angle and position
        this.player.setAngle(0);
        this.player.x = 150;
    }
    
    // Collision handlers
    hitObstacle(player, obstacle) {
        // Check if player has successfully avoided the obstacle based on current state
        const obstacleType = obstacle.getData('type');
        
        let collision = false;
        
        if (obstacleType === 'low' && !this.isJumping) {
            // Should jump over low obstacles
            collision = true;
        } else if (obstacleType === 'high' && !this.isDucking) {
            // Should duck under high obstacles
            collision = true;
        } else if (obstacleType === 'side') {
            const side = obstacle.getData('side');
            if ((side === 'left' && !this.isLeaning) || 
                (side === 'left' && this.player.x < 150) ||
                (side === 'right' && !this.isLeaning) || 
                (side === 'right' && this.player.x > 150)) {
                // Should lean away from side obstacles
                collision = true;
            }
        }
        
        if (collision) {
            this.hitSound.play();
            
            // Remove the obstacle
            obstacle.destroy();
            
            // Reduce balance when hitting obstacles
            this.balance -= 25;
            if (this.balance < 0) this.balance = 0;
            
            // Show floating balance text
            this.showFloatingText(obstacle.x, obstacle.y - 30, `-25 Balance`, 0xff0000);
            
            // Reduce lives
            this.lives--;
            
            // Update lives display
            if (this.lives >= 0 && this.livesGroup.getChildren()[0]) {
                this.livesGroup.getChildren()[0].destroy();
            }
            
            // Flash the player to indicate damage
            this.tweens.add({
                targets: this.player,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 5
            });
            
            // Game over if no lives left
            if (this.lives <= 0) {
                this.fallOffRope();
            }
        }
    }
    
    collectItem(player, collectible) {
        // Play collect sound
        this.collectSound.play();
        
        // Add points based on collectible value
        const value = collectible.getData('value');
        this.score += value;
        this.scoreText.setText(`Score: ${this.score}`);
        
        // Show floating score text
        this.showFloatingText(collectible.x, collectible.y, `+${value}`, 0x00ff00);
        
        // Increase balance slightly when collecting items
        this.balance += 10;
        if (this.balance > 100) this.balance = 100;
        
        // Show floating balance text
        this.showFloatingText(collectible.x, collectible.y - 30, `+10 Balance`, 0x00ff00);
        
        // Remove the collectible
        collectible.destroy();
    }
    
    showFloatingText(x, y, text, color) {
        const floatingText = this.add.text(x, y, text, {
            font: 'bold 24px Arial',
            fill: color ? `#${color.toString(16)}` : '#ffffff'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: floatingText,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                floatingText.destroy();
            }
        });
    }
    
    increaseSpeed() {
        if (this.gameSpeed < this.maxGameSpeed) {
            const oldSpeed = this.gameSpeed;
            this.gameSpeed += 20;
            
            // Show speed increase notification
            this.showFloatingText(
                this.sys.game.config.width / 2,
                this.sys.game.config.height / 2,
                'Speed Increased!',
                0xff0000
            );
            
            // Decrease spawn intervals as speed increases
            const speedRatio = this.gameSpeed / oldSpeed;
            this.obstacleTimer.delay *= 0.95;
            this.collectibleTimer.delay *= 0.95;
        }
    }
    
    fallOffRope() {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        this.fallSound.play();
        
        // Stop music
        this.music.stop();
        
        // Play fall animation
        this.player.play('fall');
        
        // Fall animation
        this.tweens.add({
            targets: this.player,
            y: this.sys.game.config.height + 100,
            angle: 180,
            duration: 1000,
            ease: 'Power1',
            onComplete: () => {
                // Save high score
                const highScore = localStorage.getItem('tightropeDashHighScore') || 0;
                if (this.score > highScore) {
                    localStorage.setItem('tightropeDashHighScore', this.score);
                }
                
                // Go to game over scene
                this.scene.start('GameOverScene', { score: this.score });
            }
        });
    }
}
