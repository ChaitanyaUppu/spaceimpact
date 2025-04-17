// Game variables
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const healthDisplay = document.getElementById('health-display');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');

// Set canvas size
canvas.width = 320;
canvas.height = 240;

// Game state
let gameRunning = false;
let score = 0;
let playerHealth = 100;

// Player ship
const player = {
  x: 40,
  y: canvas.height / 2,
  width: 24,
  height: 10,
  speed: 4,
  color: '#88aaff'
};

// Game objects
let bullets = [];
let enemies = [];
let stars = [];
let enemyBullets = [];

// Control states
const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
  space: false
};

// Timers
let lastEnemySpawn = 0;
let lastPlayerShot = 0;
let lastEnemyShot = 0;

// Initialize stars
function initStars() {
  for (let i = 0; i < 30; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 2 + 1
    });
  }
}

// Reset game
function resetGame() {
  score = 0;
  playerHealth = 100;
  player.x = 40;
  player.y = canvas.height / 2;
  bullets = [];
  enemies = [];
  enemyBullets = [];
  stars = [];
  initStars();
  
  scoreDisplay.textContent = `Score: ${score}`;
  healthDisplay.textContent = `Health: ${playerHealth}%`;
  gameOverScreen.style.display = 'none';
  gameRunning = true;
}

// Event listeners for keyboard
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') keys.up = true;
  if (e.key === 'ArrowDown') keys.down = true;
  if (e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'ArrowRight') keys.right = true;
  if (e.key === ' ') keys.space = true;
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp') keys.up = false;
  if (e.key === 'ArrowDown') keys.down = false;
  if (e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'ArrowRight') keys.right = false;
  if (e.key === ' ') keys.space = false;
});

// Mobile touch controls
const upButton = document.getElementById('up-button');
const downButton = document.getElementById('down-button');
const leftButton = document.getElementById('left-button');
const rightButton = document.getElementById('right-button');
const shootButton = document.getElementById('shoot-button');

// Touch start events
upButton.addEventListener('touchstart', (e) => {
  e.preventDefault();
  keys.up = true;
});

downButton.addEventListener('touchstart', (e) => {
  e.preventDefault();
  keys.down = true;
});

leftButton.addEventListener('touchstart', (e) => {
  e.preventDefault();
  keys.left = true;
});

rightButton.addEventListener('touchstart', (e) => {
  e.preventDefault();
  keys.right = true;
});

shootButton.addEventListener('touchstart', (e) => {
  e.preventDefault();
  keys.space = true;
});

// Touch end events
upButton.addEventListener('touchend', () => keys.up = false);
downButton.addEventListener('touchend', () => keys.down = false);
leftButton.addEventListener('touchend', () => keys.left = false);
rightButton.addEventListener('touchend', () => keys.right = false);
shootButton.addEventListener('touchend', () => keys.space = false);

// Mouse events for buttons (for testing on desktop)
upButton.addEventListener('mousedown', () => keys.up = true);
downButton.addEventListener('mousedown', () => keys.down = true);
leftButton.addEventListener('mousedown', () => keys.left = true);
rightButton.addEventListener('mousedown', () => keys.right = true);
shootButton.addEventListener('mousedown', () => keys.space = true);

upButton.addEventListener('mouseup', () => keys.up = false);
downButton.addEventListener('mouseup', () => keys.down = false);
leftButton.addEventListener('mouseup', () => keys.left = false);
rightButton.addEventListener('mouseup', () => keys.right = false);
shootButton.addEventListener('mouseup', () => keys.space = false);

// Handle mouse leaving button while pressed
upButton.addEventListener('mouseleave', () => keys.up = false);
downButton.addEventListener('mouseleave', () => keys.down = false);
leftButton.addEventListener('mouseleave', () => keys.left = false);
rightButton.addEventListener('mouseleave', () => keys.right = false);
shootButton.addEventListener('mouseleave', () => keys.space = false);

restartButton.addEventListener('click', resetGame);
startButton.addEventListener('click', () => {
  startScreen.style.display = 'none';
  resetGame();
});

// Game functions
function updatePlayer() {
  if (keys.up) player.y -= player.speed;
  if (keys.down) player.y += player.speed;
  if (keys.left) player.x -= player.speed;
  if (keys.right) player.x += player.speed;
  
  // Keep player in bounds
  player.x = Math.max(10, Math.min(canvas.width / 2, player.x));
  player.y = Math.max(10, Math.min(canvas.height - 10, player.y));
  
  // Player shooting
  const now = Date.now();
  if (keys.space && now - lastPlayerShot > 250) {
    bullets.push({
      x: player.x + player.width,
      y: player.y + player.height / 2,
      width: 10,
      height: 2,
      speed: 7,
      color: '#88ffff'
    });
    lastPlayerShot = now;
  }
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].x += bullets[i].speed;
    
    // Remove bullets that go off screen
    if (bullets[i].x > canvas.width) {
      bullets.splice(i, 1);
    }
  }
}

function updateEnemyBullets() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    enemyBullets[i].x -= enemyBullets[i].speed;
    
    // Check collision with player
    if (
      enemyBullets[i].x < player.x + player.width &&
      enemyBullets[i].x + enemyBullets[i].width > player.x &&
      enemyBullets[i].y < player.y + player.height &&
      enemyBullets[i].y + enemyBullets[i].height > player.y
    ) {
      playerHealth -= 10;
      healthDisplay.textContent = `Health: ${playerHealth}%`;
      enemyBullets.splice(i, 1);
      
      if (playerHealth <= 0) {
        gameOver();
      }
      continue;
    }
    
    // Remove bullets that go off screen
    if (enemyBullets[i].x < 0) {
      enemyBullets.splice(i, 1);
    }
  }
}

function spawnEnemy() {
  const now = Date.now();
  if (now - lastEnemySpawn > 1500) {
    const type = Math.floor(Math.random() * 3);
    let enemyConfig;
    
    if (type === 0) {
      // Small fast enemy
      enemyConfig = {
        x: canvas.width,
        y: Math.random() * (canvas.height - 20) + 10,
        width: 16,
        height: 8,
        speed: 3,
        health: 1,
        color: '#ff5555',
        points: 10,
        shootChance: 0.002
      };
    } else if (type === 1) {
      // Medium enemy
      enemyConfig = {
        x: canvas.width,
        y: Math.random() * (canvas.height - 30) + 15,
        width: 24,
        height: 12,
        speed: 2,
        health: 2,
        color: '#ffaa55',
        points: 20,
        shootChance: 0.004
      };
    } else {
      // Large slow enemy
      enemyConfig = {
        x: canvas.width,
        y: Math.random() * (canvas.height - 40) + 20,
        width: 36,
        height: 20,
        speed: 1,
        health: 4,
        color: '#ff5599',
        points: 30,
        shootChance: 0.008
      };
    }
    
    enemies.push(enemyConfig);
    lastEnemySpawn = now;
  }
}

function updateEnemies() {
  const now = Date.now();
  
  for (let i = enemies.length - 1; i >= 0; i--) {
    // Move enemy
    enemies[i].x -= enemies[i].speed;
    
    // Enemy shooting
    if (Math.random() < enemies[i].shootChance) {
      enemyBullets.push({
        x: enemies[i].x,
        y: enemies[i].y + enemies[i].height / 2,
        width: 8,
        height: 2,
        speed: 5,
        color: '#ff8888'
      });
    }
    
    // Check collision with player bullets
    for (let j = bullets.length - 1; j >= 0; j--) {
      if (
        bullets[j].x < enemies[i].x + enemies[i].width &&
        bullets[j].x + bullets[j].width > enemies[i].x &&
        bullets[j].y < enemies[i].y + enemies[i].height &&
        bullets[j].y + bullets[j].height > enemies[i].y
      ) {
        enemies[i].health--;
        bullets.splice(j, 1);
        
        // Check if enemy is destroyed
        if (enemies[i].health <= 0) {
          score += enemies[i].points;
          scoreDisplay.textContent = `Score: ${score}`;
          enemies.splice(i, 1);
          break;
        }
      }
    }
    
    // Check collision with player
    if (
      enemies[i] && // Make sure enemy still exists
      enemies[i].x < player.x + player.width &&
      enemies[i].x + enemies[i].width > player.x &&
      enemies[i].y < player.y + player.height &&
      enemies[i].y + enemies[i].height > player.y
    ) {
      playerHealth -= 20;
      healthDisplay.textContent = `Health: ${playerHealth}%`;
      enemies.splice(i, 1);
      
      if (playerHealth <= 0) {
        gameOver();
      }
      continue;
    }
    
    // Remove enemies that go off screen
    if (enemies[i] && enemies[i].x + enemies[i].width < 0) {
      enemies.splice(i, 1);
    }
  }
}

function updateStars() {
  for (let i = 0; i < stars.length; i++) {
    stars[i].x -= stars[i].speed;
    
    // Reset stars that go off screen
    if (stars[i].x < 0) {
      stars[i].x = canvas.width;
      stars[i].y = Math.random() * canvas.height;
    }
  }
}

function gameOver() {
  gameRunning = false;
  finalScoreDisplay.textContent = `Your score: ${score}`;
  gameOverScreen.style.display = 'flex';
}

function draw() {
  // Clear canvas
  ctx.fillStyle = '#000033';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw stars
  for (let i = 0; i < stars.length; i++) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(stars[i].x, stars[i].y, stars[i].size, stars[i].size);
  }
  
  // Draw player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  // Draw player details
  ctx.fillRect(player.x - 4, player.y + player.height / 2 - 1, 4, 2);
  
  // Draw bullets
  for (let i = 0; i < bullets.length; i++) {
    ctx.fillStyle = bullets[i].color;
    ctx.fillRect(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height);
  }
  
  // Draw enemy bullets
  for (let i = 0; i < enemyBullets.length; i++) {
    ctx.fillStyle = enemyBullets[i].color;
    ctx.fillRect(enemyBullets[i].x, enemyBullets[i].y, enemyBullets[i].width, enemyBullets[i].height);
  }
  
  // Draw enemies
  for (let i = 0; i < enemies.length; i++) {
    ctx.fillStyle = enemies[i].color;
    ctx.fillRect(enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);
    
    // Draw enemy details based on type
    if (enemies[i].width <= 16) {
      // Small enemy detail
      ctx.fillRect(enemies[i].x + enemies[i].width, enemies[i].y + enemies[i].height / 2 - 1, 3, 2);
    } else if (enemies[i].width <= 24) {
      // Medium enemy details
      ctx.fillRect(enemies[i].x + enemies[i].width, enemies[i].y + enemies[i].height / 3, 4, 2);
      ctx.fillRect(enemies[i].x + enemies[i].width, enemies[i].y + enemies[i].height * 2/3, 4, 2);
    } else {
      // Large enemy details
      ctx.fillRect(enemies[i].x + enemies[i].width, enemies[i].y + enemies[i].height / 4, 5, 2);
      ctx.fillRect(enemies[i].x + enemies[i].width, enemies[i].y + enemies[i].height / 2, 5, 2);
      ctx.fillRect(enemies[i].x + enemies[i].width, enemies[i].y + enemies[i].height * 3/4, 5, 2);
    }
  }
}

function gameLoop() {
  if (gameRunning) {
    updatePlayer();
    updateBullets();
    updateEnemyBullets();
    spawnEnemy();
    updateEnemies();
    updateStars();
    draw();
  }
  
  requestAnimationFrame(gameLoop);
}

// Check if mobile device
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Show/hide mobile controls based on device
if (!isMobileDevice()) {
  // Always show controls for now, even on desktop for testing
  // document.getElementById('mobile-controls').style.display = 'none';
}

// Initialize the game
initStars();
gameLoop();

// Prevent page scrolling when touching game controls
document.addEventListener('touchmove', function(e) {
  if (e.target.id === 'up-button' || 
      e.target.id === 'down-button' || 
      e.target.id === 'left-button' || 
      e.target.id === 'right-button' || 
      e.target.id === 'shoot-button') {
    e.preventDefault();
  }
}, { passive: false });