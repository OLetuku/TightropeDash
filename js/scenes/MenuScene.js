class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // Background
        this.add.rectangle(0, 0, this.sys.game.config.width, this.sys.game.config.height, 0xffb6c1).setOrigin(0);
        
        // Title
        const title = this.add.text(this.sys.game.config.width / 2, 150, 'TIGHTROPE DASH', {
            font: 'bold 64px Arial',
            fill: '#e25822', // Orange color matching the website
            stroke: '#ffffff',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Subtitle
        this.add.text(this.sys.game.config.width / 2, 220, 'An Endless Runner Game', {
            font: '24px Arial',
            fill: '#e25822'
        }).setOrigin(0.5);
        
        // Play button
        const playButton = this.add.rectangle(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2 + 50,
            200,
            60,
            0xe25822 // Orange color
        ).setInteractive();
        
        // Play text
        const playText = this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height / 2 + 50,
            'PLAY',
            {
                font: 'bold 32px Arial',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        // Instructions
        this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height - 150,
            'Swipe to control your tightrope walker:\nUp: Jump | Down: Duck | Left/Right: Lean',
            {
                font: '18px Arial',
                fill: '#e25822',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // High score
        const highScore = localStorage.getItem('tightropeDashHighScore') || 0;
        this.add.text(
            this.sys.game.config.width / 2,
            this.sys.game.config.height - 80,
            `High Score: ${highScore}`,
            {
                font: '24px Arial',
                fill: '#e25822'
            }
        ).setOrigin(0.5);
        
        // Button interactions
        playButton.on('pointerdown', () => {
            playButton.fillColor = 0xd14e18; // Darker orange when pressed
        });
        
        playButton.on('pointerup', () => {
            playButton.fillColor = 0xe25822;
            this.scene.start('GameScene');
        });
        
        playButton.on('pointerout', () => {
            playButton.fillColor = 0xe25822;
        });
        
        // Add some animation to the title
        this.tweens.add({
            targets: title,
            y: 140,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut'
        });
    }
}
