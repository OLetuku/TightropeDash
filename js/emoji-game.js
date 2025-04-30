// Tightrope Dash - Emoji Edition
// Main game logic

// Game variables
let gameState = {
    isPlaying: false,
    score: 0,
    lives: 3,
    balance: 100,
    gameSpeed: 5,
    maxGameSpeed: 15,
    lastSpeedIncrease: 0,
    speedIncreaseInterval: 5000, // 5 seconds
    isJumping: false,
    isDucking: false,
    isLeaningLeft: false,
    isLeaningRight: false,
    obstacles: [],
    collectibles: [],
    nextObstacleTime: 0,
    nextCollectibleTime: 0,
    obstacleInterval: 2000, // 2 seconds
    collectibleInterval: 3000, // 3 seconds
    highScore: 0
};

// DOM Elements
const gameContainer = document.getElementById('game-container');
const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const rope = document.getElementById('rope');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const balanceBar = document.getElementById('balance-bar');
const menuScreen = document.getElementById('menu-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const playButton = document.getElementById('play-button');
const playAgainButton = document.getElementById('play-again-button');
const menuButton = document.getElementById('menu-button');
const highScoreDisplay = document.getElementById('high-score');
const finalScoreDisplay = document.getElementById('final-score');
const finalHighScoreDisplay = document.getElementById('final-high-score');

// Load high score from local storage
function loadHighScore() {
    const savedHighScore = localStorage.getItem('tightropeDashHighScore');
    if (savedHighScore) {
        gameState.highScore = parseInt(savedHighScore);
        highScoreDisplay.textContent = `High Score: ${gameState.highScore}`;
    }
}

// Save high score to local storage
function saveHighScore() {
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('tightropeDashHighScore', gameState.highScore);
    }
}

// Initialize game
function init() {
    // Load high score
    loadHighScore();
    
    // Set up event listeners
    playButton.addEventListener('click', startGame);
    playAgainButton.addEventListener('click', startGame);
    menuButton.addEventListener('click', showMenu);
    
    // Set up swipe and keyboard controls
    setupControls();
}

// Show menu screen
function showMenu() {
    menuScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    resetGame();
}

// Start the game
function startGame() {
    // Hide menu and game over screens
    menuScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    // Reset game state
    resetGame();
    
    // Start game loop
    gameState.isPlaying = true;
    requestAnimationFrame(gameLoop);
}

// Reset game state
function resetGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.balance = 100;
    gameState.gameSpeed = 5;
    gameState.isJumping = false;
    gameState.isDucking = false;
    gameState.isLeaningLeft = false;
    gameState.isLeaningRight = false;
    gameState.lastSpeedIncrease = Date.now();
    
    // Clear obstacles and collectibles
    gameState.obstacles.forEach(obstacle => obstacle.element.remove());
    gameState.collectibles.forEach(collectible => collectible.element.remove());
    gameState.obstacles = [];
    gameState.collectibles = [];
    
    // Reset player
    player.style.transform = 'translateY(-50%)';
    player.style.left = '150px';
    player.textContent = emojiAssets.player.idle;
    
    // Reset UI
    updateScore();
    updateLives();
    updateBalanceBar();
}

// Game loop
let lastTime = 0;
function gameLoop(timestamp) {
    if (!gameState.isPlaying) return;
    
    const deltaTime = lastTime ? timestamp - lastTime : 0;
    lastTime = timestamp;
    
    // Update game state
    updatePlayer(deltaTime, timestamp);
    updateObstacles(deltaTime, timestamp);
    updateCollectibles(deltaTime, timestamp);
    
    // Check for collisions
    checkCollisions();
    
    // Increase difficulty over time
    if (timestamp - gameState.lastSpeedIncrease > gameState.speedIncreaseInterval) {
        increaseSpeed();
        gameState.lastSpeedIncrease = timestamp;
    }
    
    // Increase score over time
    if (deltaTime) {
        gameState.score += Math.floor(deltaTime / 100);
        updateScore();
    }
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Update player
function updatePlayer(deltaTime, timestamp) {
    // Apply rope wobble effect
    if (!gameState.isJumping) {
        const wobbleSpeed = 0.002 * gameState.gameSpeed;
        const wobbleAmount = 5 + (gameState.gameSpeed / gameState.maxGameSpeed) * 15;
        const wobble = Math.sin(timestamp * wobbleSpeed) * wobbleAmount;
        player.style.top = `calc(50% + ${wobble}px)`;
    }
    
    // Update balance
    if (gameState.isLeaningLeft || gameState.isLeaningRight) {
        gameState.balance -= 0.2 * deltaTime / 16;
        if (gameState.balance <= 0) {
            gameState.balance = 0;
            fallOffRope();
        }
    } else {
        // Recover balance when not leaning
        gameState.balance += 0.05 * deltaTime / 16;
        gameState.balance = Math.min(gameState.balance, 100);
    }
    
    updateBalanceBar();
}

// Update obstacles
function updateObstacles(deltaTime, timestamp) {
    // Spawn new obstacles
    if (timestamp > gameState.nextObstacleTime) {
        spawnObstacle();
        gameState.nextObstacleTime = timestamp + gameState.obstacleInterval * (0.8 + Math.random() * 0.4);
    }
    
    // Move obstacles
    gameState.obstacles.forEach((obstacle, index) => {
        obstacle.x -= gameState.gameSpeed * deltaTime / 16;
        obstacle.element.style.left = `${obstacle.x}px`;
        
        // Remove obstacles that have gone off screen
        if (obstacle.x < -50) {
            obstacle.element.remove();
            gameState.obstacles.splice(index, 1);
        }
    });
}

// Update collectibles
function updateCollectibles(deltaTime, timestamp) {
    // Spawn new collectibles
    if (timestamp > gameState.nextCollectibleTime) {
        spawnCollectible();
        gameState.nextCollectibleTime = timestamp + gameState.collectibleInterval * (0.8 + Math.random() * 0.4);
    }
    
    // Move collectibles
    gameState.collectibles.forEach((collectible, index) => {
        collectible.x -= gameState.gameSpeed * deltaTime / 16;
        collectible.element.style.left = `${collectible.x}px`;
        
        // Remove collectibles that have gone off screen
        if (collectible.x < -50) {
            collectible.element.remove();
            gameState.collectibles.splice(index, 1);
        }
    });
}

// Spawn obstacle
function spawnObstacle() {
    // Create obstacle element
    const obstacleElement = document.createElement('div');
    obstacleElement.classList.add('obstacle', 'emoji-sprite');
    
    // Determine obstacle type
    const types = ['low', 'high', 'sideLeft', 'sideRight'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Set obstacle emoji based on type
    obstacleElement.textContent = emojiAssets.obstacles[type];
    
    // Position obstacle
    const x = gameArea.clientWidth + 50;
    let y = gameArea.clientHeight / 2;
    
    if (type === 'high') {
        y -= 40; // Position high obstacles higher
    } else if (type === 'low') {
        y += 20; // Position low obstacles lower
    }
    
    obstacleElement.style.left = `${x}px`;
    obstacleElement.style.top = `${y}px`;
    
    // Add obstacle to game area
    gameArea.appendChild(obstacleElement);
    
    // Add obstacle to game state
    gameState.obstacles.push({
        element: obstacleElement,
        x: x,
        y: y,
        type: type,
        width: 36,
        height: 36
    });
}

// Spawn collectible
function spawnCollectible() {
    // Create collectible element
    const collectibleElement = document.createElement('div');
    collectibleElement.classList.add('collectible', 'emoji-sprite');
    
    // Determine collectible type
    const type = Math.random() < 0.5 ? 'hat' : 'baton';
    
    // Set collectible emoji based on type
    collectibleElement.textContent = emojiAssets.collectibles[type];
    
    // Position collectible
    const x = gameArea.clientWidth + 50;
    const y = gameArea.clientHeight / 2 - 30 - Math.random() * 40; // Random height above the rope
    
    collectibleElement.style.left = `${x}px`;
    collectibleElement.style.top = `${y}px`;
    
    // Add collectible to game area
    gameArea.appendChild(collectibleElement);
    
    // Add collectible to game state
    gameState.collectibles.push({
        element: collectibleElement,
        x: x,
        y: y,
        type: type,
        value: type === 'hat' ? 10 : 20,
        width: 30,
        height: 30
    });
}

// Check for collisions
function checkCollisions() {
    // Get player bounds
    const playerRect = {
        x: parseInt(player.style.left || 150),
        y: player.getBoundingClientRect().top - gameArea.getBoundingClientRect().top,
        width: 48,
        height: 48
    };
    
    // Check obstacle collisions
    gameState.obstacles.forEach((obstacle, index) => {
        if (checkCollision(playerRect, obstacle)) {
            // Check if player successfully avoided the obstacle based on current state
            let collision = false;
            
            if (obstacle.type === 'low' && !gameState.isJumping) {
                // Should jump over low obstacles
                collision = true;
            } else if (obstacle.type === 'high' && !gameState.isDucking) {
                // Should duck under high obstacles
                collision = true;
            } else if (obstacle.type === 'sideLeft' && !gameState.isLeaningRight) {
                // Should lean right to avoid left obstacles
                collision = true;
            } else if (obstacle.type === 'sideRight' && !gameState.isLeaningLeft) {
                // Should lean left to avoid right obstacles
                collision = true;
            }
            
            if (collision) {
                hitObstacle(obstacle, index);
            }
        }
    });
    
    // Check collectible collisions
    gameState.collectibles.forEach((collectible, index) => {
        if (checkCollision(playerRect, collectible)) {
            collectItem(collectible, index);
        }
    });
}

// Check if two rectangles are colliding
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// Handle obstacle hit
function hitObstacle(obstacle, index) {
    // Remove the obstacle
    obstacle.element.remove();
    gameState.obstacles.splice(index, 1);
    
    // Reduce lives
    gameState.lives--;
    updateLives();
    
    // Flash the player to indicate damage
    player.style.opacity = 0.5;
    setTimeout(() => {
        player.style.opacity = 1;
    }, 300);
    
    // Game over if no lives left
    if (gameState.lives <= 0) {
        fallOffRope();
    }
}

// Handle collectible collection
function collectItem(collectible, index) {
    // Add points based on collectible value
    gameState.score += collectible.value;
    updateScore();
    
    // Show floating score text
    showFloatingText(collectible.x, collectible.y, `+${collectible.value}`);
    
    // Increase balance slightly
    gameState.balance += 5;
    gameState.balance = Math.min(gameState.balance, 100);
    updateBalanceBar();
    
    // Remove the collectible
    collectible.element.remove();
    gameState.collectibles.splice(index, 1);
}

// Show floating text
function showFloatingText(x, y, text) {
    const floatingText = document.createElement('div');
    floatingText.style.position = 'absolute';
    floatingText.style.left = `${x}px`;
    floatingText.style.top = `${y}px`;
    floatingText.style.color = '#e25822';
    floatingText.style.fontWeight = 'bold';
    floatingText.style.fontSize = '24px';
    floatingText.style.zIndex = '20';
    floatingText.textContent = text;
    
    gameArea.appendChild(floatingText);
    
    // Animate the floating text
    let opacity = 1;
    let posY = y;
    
    const animateText = () => {
        opacity -= 0.02;
        posY -= 1;
        
        floatingText.style.opacity = opacity;
        floatingText.style.top = `${posY}px`;
        
        if (opacity > 0) {
            requestAnimationFrame(animateText);
        } else {
            floatingText.remove();
        }
    };
    
    requestAnimationFrame(animateText);
}

// Increase game speed
function increaseSpeed() {
    if (gameState.gameSpeed < gameState.maxGameSpeed) {
        gameState.gameSpeed += 0.5;
        
        // Show speed increase notification
        showFloatingText(
            gameArea.clientWidth / 2,
            gameArea.clientHeight / 2,
            'Speed Increased!'
        );
        
        // Decrease spawn intervals as speed increases
        gameState.obstacleInterval *= 0.95;
        gameState.collectibleInterval *= 0.95;
    }
}

// Fall off rope (game over)
function fallOffRope() {
    gameState.isPlaying = false;
    
    // Play fall animation
    player.textContent = emojiAssets.player.fall;
    
    // Animate falling
    let posY = parseInt(player.style.top) || gameArea.clientHeight / 2;
    let rotation = 0;
    
    const animateFall = () => {
        posY += 5;
        rotation += 5;
        
        player.style.top = `${posY}px`;
        player.style.transform = `rotate(${rotation}deg)`;
        
        if (posY < gameArea.clientHeight + 100) {
            requestAnimationFrame(animateFall);
        } else {
            // Show game over screen
            showGameOver();
        }
    };
    
    requestAnimationFrame(animateFall);
}

// Show game over screen
function showGameOver() {
    // Save high score
    saveHighScore();
    
    // Update score displays
    finalScoreDisplay.textContent = `Score: ${gameState.score}`;
    finalHighScoreDisplay.textContent = `High Score: ${gameState.highScore}`;
    
    // Show new high score notification if applicable
    if (gameState.score === gameState.highScore && gameState.score > 0) {
        const newHighScoreText = document.createElement('p');
        newHighScoreText.textContent = 'New High Score!';
        newHighScoreText.style.color = '#e25822';
        newHighScoreText.style.fontWeight = 'bold';
        newHighScoreText.style.fontSize = '28px';
        
        // Insert before the play again button
        gameOverScreen.insertBefore(newHighScoreText, playAgainButton);
    }
    
    // Show game over screen
    gameOverScreen.classList.remove('hidden');
}

// Update score display
function updateScore() {
    scoreDisplay.textContent = `Score: ${gameState.score}`;
}

// Update lives display
function updateLives() {
    livesDisplay.textContent = '❤️'.repeat(gameState.lives);
}

// Update balance bar
function updateBalanceBar() {
    balanceBar.style.width = `${gameState.balance}%`;
    
    // Change color based on balance level
    if (gameState.balance < 30) {
        balanceBar.style.backgroundColor = '#ff0000'; // Red
    } else if (gameState.balance < 60) {
        balanceBar.style.backgroundColor = '#ffff00'; // Yellow
    } else {
        balanceBar.style.backgroundColor = '#e25822'; // Orange
    }
}

// Player actions
function jump() {
    if (gameState.isJumping || gameState.isDucking) return;
    
    gameState.isJumping = true;
    player.textContent = emojiAssets.player.jump;
    
    // Reduce balance when jumping
    gameState.balance -= 5;
    gameState.balance = Math.max(0, gameState.balance);
    updateBalanceBar();
    
    // Jump animation
    const startY = parseInt(player.style.top) || gameArea.clientHeight / 2;
    let jumpHeight = 0;
    const maxJumpHeight = 100;
    const jumpSpeed = 5;
    let goingUp = true;
    
    const animateJump = () => {
        if (goingUp) {
            jumpHeight += jumpSpeed;
            if (jumpHeight >= maxJumpHeight) {
                goingUp = false;
            }
        } else {
            jumpHeight -= jumpSpeed;
        }
        
        player.style.top = `${startY - jumpHeight}px`;
        
        if (jumpHeight > 0 && gameState.isJumping) {
            requestAnimationFrame(animateJump);
        } else {
            // End jump
            gameState.isJumping = false;
            player.textContent = emojiAssets.player.idle;
        }
    };
    
    requestAnimationFrame(animateJump);
}

function duck() {
    if (gameState.isJumping || gameState.isDucking) return;
    
    gameState.isDucking = true;
    player.textContent = emojiAssets.player.duck;
    
    // Reduce balance when ducking
    gameState.balance -= 5;
    gameState.balance = Math.max(0, gameState.balance);
    updateBalanceBar();
    
    // Duck animation - scale player down
    player.style.fontSize = '32px';
    
    // End duck after a delay
    setTimeout(() => {
        gameState.isDucking = false;
        player.textContent = emojiAssets.player.idle;
        player.style.fontSize = '48px';
    }, 600);
}

function leanLeft() {
    if (gameState.isDucking) return;
    
    gameState.isLeaningLeft = true;
    gameState.isLeaningRight = false;
    player.textContent = emojiAssets.player.leanLeft;
    
    // Move slightly to the left
    player.style.left = '130px';
}

function leanRight() {
    if (gameState.isDucking) return;
    
    gameState.isLeaningRight = true;
    gameState.isLeaningLeft = false;
    player.textContent = emojiAssets.player.leanRight;
    
    // Move slightly to the right
    player.style.left = '170px';
}

function stopLeaning() {
    if (gameState.isJumping || gameState.isDucking) return;
    
    gameState.isLeaningLeft = false;
    gameState.isLeaningRight = false;
    player.textContent = emojiAssets.player.idle;
    
    // Reset position
    player.style.left = '150px';
}

// Set up swipe and keyboard controls
function setupControls() {
    // Keyboard controls
    document.addEventListener('keydown', (event) => {
        if (!gameState.isPlaying) return;
        
        switch (event.key) {
            case 'ArrowUp':
                jump();
                break;
            case 'ArrowDown':
                duck();
                break;
            case 'ArrowLeft':
                leanLeft();
                break;
            case 'ArrowRight':
                leanRight();
                break;
        }
    });
    
    document.addEventListener('keyup', (event) => {
        if (!gameState.isPlaying) return;
        
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            stopLeaning();
        }
    });
    
    // Touch and swipe controls
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    
    gameContainer.addEventListener('touchstart', (event) => {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
        touchStartTime = Date.now();
    });
    
    gameContainer.addEventListener('touchend', (event) => {
        if (!gameState.isPlaying) return;
        
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;
        const touchEndTime = Date.now();
        
        const touchTime = touchEndTime - touchStartTime;
        const touchDistanceX = touchEndX - touchStartX;
        const touchDistanceY = touchEndY - touchStartY;
        
        // Only detect swipes, not taps
        if (touchTime < 500 && (Math.abs(touchDistanceX) > 50 || Math.abs(touchDistanceY) > 50)) {
            // Determine swipe direction
            if (Math.abs(touchDistanceX) > Math.abs(touchDistanceY)) {
                // Horizontal swipe
                if (touchDistanceX > 0) {
                    leanRight();
                    setTimeout(stopLeaning, 500);
                } else {
                    leanLeft();
                    setTimeout(stopLeaning, 500);
                }
            } else {
                // Vertical swipe
                if (touchDistanceY > 0) {
                    duck();
                } else {
                    jump();
                }
            }
        }
    });
}

// Initialize the game when the page loads
window.addEventListener('load', init);
