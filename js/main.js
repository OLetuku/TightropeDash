// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Create a new Phaser game instance with our configuration
    const game = new Phaser.Game(config);
    
    // Add the game instance to the window object for debugging
    window.game = game;
});
