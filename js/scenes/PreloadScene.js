class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Display loading progress
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Loading text
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            font: '20px Arial',
            fill: '#e25822' // Orange color matching the website
        }).setOrigin(0.5);
        
        // Progress bar background
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0xe25822, 0.8); // Orange color
        progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);
        
        // Loading progress events
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
        
        // Load game assets
        
        // Player assets
        this.load.spritesheet('player', 'assets/images/tightrope_walker.png', { 
            frameWidth: 64, 
            frameHeight: 96 
        });
        
        // Obstacle assets
        this.load.image('obstacle1', 'assets/images/obstacle1.png');
        this.load.image('obstacle2', 'assets/images/obstacle2.png');
        this.load.image('obstacle3', 'assets/images/obstacle3.png');
        
        // Collectible assets
        this.load.image('hat', 'assets/images/hat.png');
        this.load.image('baton', 'assets/images/baton.png');
        
        // Environment assets
        this.load.image('background', 'assets/images/background.png');
        this.load.image('rope', 'assets/images/rope.png');
        
        // UI assets
        this.load.image('balance_meter', 'assets/images/balance_meter.png');
        this.load.image('balance_indicator', 'assets/images/balance_indicator.png');
        this.load.image('heart', 'assets/images/heart.png');
        this.load.image('title', 'assets/images/title.png');
        this.load.image('play_button', 'assets/images/play_button.png');
        
        // Audio assets
        this.load.audio('jump', 'assets/audio/jump.mp3');
        this.load.audio('collect', 'assets/audio/collect.mp3');
        this.load.audio('hit', 'assets/audio/hit.mp3');
        this.load.audio('fall', 'assets/audio/fall.mp3');
        this.load.audio('music', 'assets/audio/music.mp3');
    }

    create() {
        // Create animations
        
        // Player animations
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: 0
        });
        
        this.anims.create({
            key: 'duck',
            frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
            frameRate: 10,
            repeat: 0
        });
        
        this.anims.create({
            key: 'lean_left',
            frames: this.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
            frameRate: 10,
            repeat: 0
        });
        
        this.anims.create({
            key: 'lean_right',
            frames: this.anims.generateFrameNumbers('player', { start: 16, end: 19 }),
            frameRate: 10,
            repeat: 0
        });
        
        this.anims.create({
            key: 'fall',
            frames: this.anims.generateFrameNumbers('player', { start: 20, end: 23 }),
            frameRate: 10,
            repeat: 0
        });
        
        // Proceed to the menu scene
        this.scene.start('MenuScene');
    }
}
