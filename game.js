const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const playerImage = new Image();
playerImage.src = 'player.png';

const backgroundImage = new Image();
backgroundImage.src = 'background.png';

// Set canvas size
canvas.width = 400;
canvas.height = 600;

// Game variables
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let isPaused = false;
let gameOver = false;
let gameStarted = false;
let platforms = [];
let bubbles = [];
let playerDirection = 1; // 1 for right, -1 for left

// Array for purchased characters
let purchasedCharacters = [];

// Character class
class Character {
    constructor(emoji, x, y) {
        this.emoji = emoji;
        this.x = x;
        this.y = y;
        this.size = 30;
        this.speed = Math.random() * 0.5 + 0.2; // Random speed
        this.amplitude = Math.random() * 20 + 10; // Amplitude of oscillation
        this.angle = Math.random() * Math.PI * 2; // Initial angle
    }

    update() {
        // Oscillating movement
        this.angle += 0.02;
        this.x += Math.sin(this.angle) * 0.5;
        this.y += this.speed;

        // Reappear at the top when reaching the bottom
        if (this.y > canvas.height + this.size) {
            this.y = -this.size;
            this.x = Math.random() * (canvas.width - this.size);
        }
    }

    draw() {
        ctx.font = `${this.size}px Arial`;
        ctx.fillStyle = 'white';
        ctx.fillText(this.emoji, this.x, this.y);
    }
}

// Player object
const player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 40,
    height: 40,
    velocityY: 0,
    velocityX: 0,
    speed: 4,
    jumpForce: -13,
    gravity: 0.4
};

// Platform class
class Platform {
    constructor(x, y, width = 70) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 15;
        this.color = '#fff';
        this.touched = false; // Check if platform is touched
    }

    draw() {
        // Show touched platforms with reduced opacity
        ctx.fillStyle = this.touched ? 'rgba(255, 255, 255, 0.5)' : this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Bubble class for background
class Bubble {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * canvas.height; // Start from bottom
        this.size = Math.random() * 4 + 2; // Slightly larger than stars
        this.speed = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.wobbleSpeed = Math.random() * 0.03;
        this.wobbleAmount = Math.random() * 1;
        this.angle = Math.random() * Math.PI * 2;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x + Math.sin(this.angle) * this.wobbleAmount, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.y -= this.speed; // Move upward
        this.angle += this.wobbleSpeed;
        if (this.y < -this.size) {
            this.y = canvas.height + this.size;
            this.x = Math.random() * canvas.width;
        }
    }
}

// Initialize bubbles
for (let i = 0; i < 50; i++) {
    bubbles.push(new Bubble());
}

// Generate initial platforms
function generatePlatforms() {
    platforms = [];
    // Add starting platform (wider than regular platforms)
    const startX = canvas.width / 2 - 60; // Starting platform's x position
    platforms.push(new Platform(startX, canvas.height - 50, 120));
    
    // Generate random platforms
    for (let i = 0; i < 8; i++) {
        platforms.push(new Platform(
            Math.random() * (canvas.width - 70),
            canvas.height - 150 - i * 100
        ));
    }
}

// Game controls
let keys = {
    left: false,
    right: false
};

// Touch controls
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// Event listeners for touch buttons
function setupTouchControls() {
    // Left button
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.left = true;
        playerDirection = -1;
    });

    leftBtn.addEventListener('touchend', () => {
        keys.left = false;
    });

    // Right button
    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.right = true;
        playerDirection = 1;
    });

    rightBtn.addEventListener('touchend', () => {
        keys.right = false;
    });
}

setupTouchControls();

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameStarted) return;
    
    switch(e.code) {
        case 'ArrowLeft':
            keys.left = true;
            playerDirection = -1;
            break;
        case 'ArrowRight':
            keys.right = true;
            playerDirection = 1;
            break;
        case 'KeyP': // P key to pause
            isPaused = !isPaused;
            pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
            break;
        case 'KeyM': // M key to toggle market
            toggleMarket();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.code) {
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'ArrowRight':
            keys.right = false;
            break;
    }
});

// Start button
const startBtn = document.getElementById('startBtn');
startBtn.addEventListener('click', () => {
    document.getElementById('startScreen').style.display = 'none';
    gameStarted = true;
    resetGame();
});

// Pause button
const pauseBtn = document.getElementById('pauseBtn');
pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
});

// Restart button
const restartBtn = document.getElementById('restartBtn');
restartBtn.addEventListener('click', () => {
    document.getElementById('gameOver').style.display = 'none';
    resetGame();
});

// Reset game
function resetGame() {
    score = 0;
    gameOver = false;
    
    // Generate platforms first
    generatePlatforms();
    
    // Start on the starting platform
    const startPlatform = platforms[0]; // First platform is always the starting platform
    player.x = startPlatform.x + (startPlatform.width / 2) - (player.width / 2); // Center of the platform
    player.y = startPlatform.y - player.height; // On top of the platform
    player.velocityY = 0;
    player.velocityX = 0;
    
    // Reset characters but don't delete them
    purchasedCharacters.forEach(character => {
        character.x = Math.random() * (canvas.width - 30);
        character.y = Math.random() * canvas.height;
    });
    
    updateScore();
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('finalScore').textContent = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        document.getElementById('highScore').textContent = 'HIGH SCORE: ' + highScore;
    }
}

// Game loop
function update() {
    if (!isPaused && gameStarted && !gameOver) {
        // Handle horizontal movement
        if (keys.left) {
            player.velocityX = -player.speed;
        } else if (keys.right) {
            player.velocityX = player.speed;
        } else {
            player.velocityX = 0;
        }
        
        // Update player position
        player.x += player.velocityX;
        player.velocityY += player.gravity;
        player.y += player.velocityY;

        // Check platform collisions
        platforms.forEach(platform => {
            if (player.velocityY > 0 &&
                player.y + player.height > platform.y &&
                player.y + player.height < platform.y + platform.height &&
                player.x + player.width > platform.x &&
                player.x < platform.x + platform.width) {
                
                player.y = platform.y - player.height;
                player.velocityY = player.jumpForce;

                // Give points for first touch on platform
                if (!platform.touched) {
                    score += 10;
                    platform.touched = true;
                    updateScore();
                }
            }
        });

        // Move platforms down when player reaches upper half
        if (player.y < canvas.height / 2) {
            const diff = canvas.height / 2 - player.y;
            player.y = canvas.height / 2;
            platforms.forEach(platform => {
                platform.y += diff;
            });
        }

        // Remove platforms that are off screen and add new ones
        platforms = platforms.filter(platform => platform.y < canvas.height);
        while (platforms.length < 8) {
            platforms.push(new Platform(
                Math.random() * (canvas.width - 70),
                platforms[platforms.length - 1].y - 100
            ));
        }

        // Update bubbles
        bubbles.forEach(bubble => bubble.update());

        // Check game over
        if (player.y > canvas.height) {
            gameOver = true;
            document.getElementById('gameOver').style.display = 'block';
        }

        // Keep player in bounds
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    }
}

// Draw game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background image with opacity
    ctx.globalAlpha = 0.3; // Background image opacity
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0; // Reset opacity for other elements
    
    // Draw bubbles with opacity
    bubbles.forEach(bubble => {
        bubble.update();
        bubble.draw();
    });

    if (gameStarted) {
        // Draw and update purchased characters
        purchasedCharacters.forEach(character => {
            character.update();
            character.draw();
        });

        // Draw platforms
        platforms.forEach(platform => platform.draw());

        // Draw player
        ctx.save();
        if (playerDirection === -1) {
            // Flip player image when moving left
            ctx.scale(-1, 1);
            ctx.drawImage(playerImage, -player.x - player.width, player.y, player.width, player.height);
        } else {
            ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
        }
        ctx.restore();
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

// Update game character from market system
window.updateGameCharacter = function(character) {
    // Add character if not already added
    if (!purchasedCharacters.some(c => c.emoji === character.emoji)) {
        // Random starting position
        const x = Math.random() * (canvas.width - 30);
        const y = Math.random() * canvas.height;
        purchasedCharacters.push(new Character(character.emoji, x, y));
    }
};

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game loop
generatePlatforms();
gameLoop();

// Update initial high score display
document.getElementById('highScore').textContent = 'HIGH SCORE: ' + highScore;
