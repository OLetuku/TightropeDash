class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load loading screen assets
        this.load.image('logo', 'assets/images/logo.png');
    }

    create() {
        // Set up any configurations or settings
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        
        // Enable physics
        this.physics.world.setBounds(0, 0, this.sys.game.config.width, this.sys.game.config.height);
        
        // Proceed to the preload scene
        this.scene.start('PreloadScene');
    }
}
