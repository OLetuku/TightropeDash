class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.score = data.score || 0;
    }

    create() {
        // Background
        this.add.rectangle(0, 0, this.sys.game.config.width, this.sys.game.config.height, 0xffb6c1).setOrigin(0);
        
        // Game Over text
        this.add.text(this.sys.game.config.width / 2, 150, 'GAME OVER', {
            font: 'bold 64px Arial',
            fill: '#e25822', // Orange color matching the website
            stroke: '#ffffff',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Score
        this.add.text(this.sys.game.config.width / 2, 250, `Score: ${this.score}`, {
            font: '32px Arial',
            fill: '#e25822'
        }).setOrigin(0.5);
        
        // High score
        const highScore = localStorage.getItem('tightropeDashHighScore') || 0;
        const highScoreText = this.add.text(
            this.sys.game.config.width / 2,
            300,
            `High Score: ${highScore}`,
            {
                font: '32px Arial',
                fill: '#e25822'
            }
        ).setOrigin(0.5);
        
        // New high score notification
        if (this.score > highScore) {
            this.add.text(
                this.sys.game.config.width / 2,
                350,
                'New High Score!',
                {
                    font: 'bold 36px Arial',
                    fill: '#e25822',
                    stroke: '#ffffff',
                    strokeThickness: 4
                }
            ).setOrigin(0.5);
            
            // Add animation to the high score text
            this.tweens.add({
                targets: highScoreText,
                scale: 1.2,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }
        
        // Play again button
        const playAgainButton = this.add.rectangle(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2 + 100,
            200,
            60,
            0xe25822 // Orange color
        ).setInteractive();
        
        // Play again text
        const playAgainText = this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2 + 100,
            'PLAY AGAIN',
            {
                font: 'bold 24px Arial',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        // Main menu button
        const menuButton = this.add.rectangle(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2 + 180,
            200,
            60,
            0xe25822 // Orange color
        ).setInteractive();
        
        // Main menu text
        const menuText = this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2 + 180,
            'MAIN MENU',
            {
                font: 'bold 24px Arial',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        // Button interactions
        playAgainButton.on('pointerdown', () => {
            playAgainButton.fillColor = 0xd14e18; // Darker orange when pressed
        });
        
        playAgainButton.on('pointerup', () => {
            playAgainButton.fillColor = 0xe25822;
            this.scene.start('GameScene');
        });
        
        playAgainButton.on('pointerout', () => {
            playAgainButton.fillColor = 0xe25822;
        });
        
        menuButton.on('pointerdown', () => {
            menuButton.fillColor = 0xd14e18; // Darker orange when pressed
        });
        
        menuButton.on('pointerup', () => {
            menuButton.fillColor = 0xe25822;
            this.scene.start('MenuScene');
        });
        
        menuButton.on('pointerout', () => {
            menuButton.fillColor = 0xe25822;
        });
    }
}
