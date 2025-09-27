// home.js - TMA Game Home Page (Clean Version)
class TMAGame {
    constructor() {
        this.gameTitle = "TMA Game";
        this.version = "1.0.0";
        this.init();
    }

    init() {
        this.createHomeLayout();
        this.setupEventListeners();
        this.displayWelcomeMessage();
    }

    createHomeLayout() {
        // Create main container
        const container = document.createElement('div');
        container.id = 'game-container';
        container.className = 'home-container';
        
        // Game title
        const title = document.createElement('h1');
        title.textContent = this.gameTitle;
        title.className = 'game-title';
        
        // Welcome message area
        const welcomeDiv = document.createElement('div');
        welcomeDiv.id = 'welcome-message';
        welcomeDiv.className = 'welcome-section';
        
        // Game menu buttons
        const menuDiv = document.createElement('div');
        menuDiv.className = 'menu-section';
        
        const buttons = [
            { id: 'start-game', text: 'Start Game', action: 'startGame' },
            { id: 'leaderboard', text: 'Leaderboard', action: 'showLeaderboard' },
            { id: 'settings', text: 'Settings', action: 'showSettings' },
            { id: 'about', text: 'About', action: 'showAbout' }
        ];
        
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.id = btn.id;
            button.textContent = btn.text;
            button.className = 'menu-button';
            button.setAttribute('data-action', btn.action);
            menuDiv.appendChild(button);
        });
        
        // Game info section
        const infoDiv = document.createElement('div');
        infoDiv.id = 'game-info';
        infoDiv.className = 'info-section';
        
        // Append all elements
        container.appendChild(title);
        container.appendChild(welcomeDiv);
        container.appendChild(menuDiv);
        container.appendChild(infoDiv);
        
        // Add to body
        document.body.innerHTML = '';
        document.body.appendChild(container);
    }

    setupEventListeners() {
        // Add click listeners to menu buttons
        document.querySelectorAll('.menu-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                this.handleMenuAction(action);
            });
        });

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyNavigation(e);
        });
    }

    handleMenuAction(action) {
        switch(action) {
            case 'startGame':
                this.startGame();
                break;
            case 'showLeaderboard':
                this.showLeaderboard();
                break;
            case 'showSettings':
                this.showSettings();
                break;
            case 'showAbout':
                this.showAbout();
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    handleKeyNavigation(e) {
        const buttons = document.querySelectorAll('.menu-button');
        const currentFocus = document.activeElement;
        const currentIndex = Array.from(buttons).indexOf(currentFocus);
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % buttons.length;
                buttons[nextIndex].focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                buttons[prevIndex].focus();
                break;
            case 'Enter':
                if (currentFocus && currentFocus.classList.contains('menu-button')) {
                    currentFocus.click();
                }
                break;
        }
    }

    displayWelcomeMessage() {
        const welcomeEl = document.getElementById('welcome-message');
        const messages = [
            'Welcome to ' + this.gameTitle + '!',
            'Ready to challenge yourself?',
            'Use arrow keys to navigate and Enter to select.'
        ];
        
        welcomeEl.innerHTML = messages.map(msg => '<p>' + msg + '</p>').join('');
    }

    startGame() {
        console.log('Starting Geometry Dash...');
        
        // Create game selection menu
        const infoEl = document.getElementById('game-info');
        infoEl.innerHTML = `
            <h3>Select Game Mode</h3>
            <div class="game-modes">
                <button onclick="tmaGame.launchGeometryDash(false)" class="game-mode-btn">
                    🎮 Single Player
                </button>
                <button onclick="tmaGame.launchGeometryDash(true)" class="game-mode-btn">
                    👥 Multiplayer
                </button>
            </div>
            <button onclick="tmaGame.clearInfo()">Back</button>
        `;
    }

    launchGeometryDash(multiplayer) {
        console.log('🎮 Launching Geometry Dash...', multiplayer);
        
        // Replace page with game
        document.body.innerHTML = `
            <div id="game-header" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 15px 20px;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <button onclick="window.location.reload()" style="
                    padding: 10px 15px;
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">🏠 Home</button>
                <h2 style="margin: 0;">Geometry Dash ${multiplayer ? '- Multiplayer' : '- Single Player'}</h2>
                <div></div>
            </div>
            <div id="game-container" style="
                background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
                min-height: calc(100vh - 70px);
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            ">
                <canvas id="gameCanvas" style="
                    border: 3px solid #2d3436;
                    border-radius: 15px;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                "></canvas>
            </div>
        `;
        
        // Initialize game after short delay
        setTimeout(() => {
            this.initializeGame(multiplayer);
        }, 100);
    }

    initializeGame(multiplayer) {
        console.log('Initializing game...');
        
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error('Canvas not found!');
            return;
        }

        // Set canvas size
        canvas.width = Math.min(1000, window.innerWidth - 60);
        canvas.height = Math.min(500, window.innerHeight - 150);
        
        const ctx = canvas.getContext('2d');
        console.log('Canvas ready:', canvas.width + 'x' + canvas.height);
        
        // Game state
        const game = {
            player: {
                x: 50,
                y: canvas.height - 140,
                width: 40,
                height: 40,
                velocityY: 0,
                isGrounded: true,
                color: '#FF6B6B'
            },
            obstacles: [],
            gameSpeed: 3,
            gravity: 0.8,
            jumpPower: -15,
            groundY: canvas.height - 100,
            gameState: 'playing',
            camera: { x: 0 },
            levelLength: 3000
        };

        // Create obstacles
        for (let x = 300; x < game.levelLength; x += 200 + Math.random() * 200) {
            game.obstacles.push({
                x: x,
                y: game.groundY - 40,
                width: 40,
                height: 40
            });
        }

        console.log('Created', game.obstacles.length, 'obstacles');

        // Jump function
        const handleJump = () => {
            if (game.player.isGrounded && game.gameState === 'playing') {
                game.player.velocityY = game.jumpPower;
                game.player.isGrounded = false;
                console.log('Jump!');
            }
        };

        // Controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleJump();
            }
        });

        canvas.addEventListener('click', handleJump);

        // Game loop
        const gameLoop = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (game.gameState === 'playing') {
                // Physics
                if (!game.player.isGrounded) {
                    game.player.velocityY += game.gravity;
                }
                
                game.player.y += game.player.velocityY;
                game.player.x += game.gameSpeed;
                
                // Ground collision
                if (game.player.y >= game.groundY - game.player.height) {
                    game.player.y = game.groundY - game.player.height;
                    game.player.velocityY = 0;
                    game.player.isGrounded = true;
                }
                
                // Camera
                game.camera.x = game.player.x - canvas.width / 4;
                
                // Obstacle collision
                for (let i = 0; i < game.obstacles.length; i++) {
                    const obs = game.obstacles[i];
                    if (game.player.x < obs.x + obs.width &&
                        game.player.x + game.player.width > obs.x &&
                        game.player.y < obs.y + obs.height &&
                        game.player.y + game.player.height > obs.y) {
                        
                        game.gameState = 'dead';
                        console.log('Player died!');
                        
                        setTimeout(() => {
                            game.player.x = 50;
                            game.player.y = game.groundY - game.player.height;
                            game.player.velocityY = 0;
                            game.player.isGrounded = true;
                            game.camera.x = 0;
                            game.gameState = 'playing';
                        }, 1000);
                        break;
                    }
                }
                
                // Win condition
                if (game.player.x >= game.levelLength) {
                    game.gameState = 'won';
                }
            }
            
            // Render
            ctx.save();
            ctx.translate(-game.camera.x, 0);
            
            // Ground
            ctx.fillStyle = '#2D3436';
            ctx.fillRect(0, game.groundY, game.levelLength, 100);
            
            // Player
            ctx.fillStyle = game.gameState === 'dead' ? '#FF7675' : game.player.color;
            ctx.fillRect(game.player.x, game.player.y, game.player.width, game.player.height);
            
            // Obstacles (spikes)
            ctx.fillStyle = '#2D3436';
            for (let i = 0; i < game.obstacles.length; i++) {
                const obs = game.obstacles[i];
                ctx.beginPath();
                ctx.moveTo(obs.x + obs.width/2, obs.y);
                ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
                ctx.lineTo(obs.x, obs.y + obs.height);
                ctx.closePath();
                ctx.fill();
            }
            
            ctx.restore();
            
            // UI
            ctx.fillStyle = '#2D3436';
            ctx.font = 'bold 20px Arial';
            const progress = Math.floor((game.player.x / game.levelLength) * 100);
            ctx.fillText('Progress: ' + progress + '%', 20, 40);
            ctx.fillText('SPACE or Click to Jump!', 20, 70);
            
            if (multiplayer) {
                ctx.fillText('Multiplayer Mode', 20, 100);
            }
            
            // Game over screen
            if (game.gameState === 'dead') {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 48px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('DEAD', canvas.width/2, canvas.height/2);
                ctx.font = '24px Arial';
                ctx.fillText('Respawning...', canvas.width/2, canvas.height/2 + 50);
                ctx.textAlign = 'left';
            } else if (game.gameState === 'won') {
                ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 48px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('YOU WIN!', canvas.width/2, canvas.height/2);
                ctx.textAlign = 'left';
            }
            
            requestAnimationFrame(gameLoop);
        };
        
        console.log('Starting game...');
        gameLoop();
    }

    showLeaderboard() {
        const infoEl = document.getElementById('game-info');
        infoEl.innerHTML = `
            <h3>Leaderboard</h3>
            <div class="leaderboard">
                <div class="score-entry">1. Player1 - 1250 pts</div>
                <div class="score-entry">2. Player2 - 980 pts</div>
                <div class="score-entry">3. Player3 - 750 pts</div>
            </div>
            <button onclick="tmaGame.clearInfo()">Close</button>
        `;
    }

    showSettings() {
        const infoEl = document.getElementById('game-info');
        infoEl.innerHTML = `
            <h3>Settings</h3>
            <div class="settings">
                <label><input type="checkbox" id="sound-toggle"> Sound Effects</label>
                <label><input type="checkbox" id="music-toggle"> Background Music</label>
                <label><input type="range" id="difficulty" min="1" max="5" value="3"> Difficulty</label>
            </div>
            <button onclick="tmaGame.saveSettings()">Save</button>
            <button onclick="tmaGame.clearInfo()">Cancel</button>
        `;
    }

    showAbout() {
        const infoEl = document.getElementById('game-info');
        infoEl.innerHTML = `
            <h3>About ${this.gameTitle}</h3>
            <div class="about">
                <p>Version: ${this.version}</p>
                <p>A fun and engaging web game built with JavaScript.</p>
                <p>Created with ❤️ for the web gaming community.</p>
            </div>
            <button onclick="tmaGame.clearInfo()">Close</button>
        `;
    }

    saveSettings() {
        const soundToggle = document.getElementById('sound-toggle');
        const musicToggle = document.getElementById('music-toggle');
        const difficultySlider = document.getElementById('difficulty');
        
        const settings = {
            sound: soundToggle ? soundToggle.checked : false,
            music: musicToggle ? musicToggle.checked : false,
            difficulty: difficultySlider ? difficultySlider.value : 3
        };
        
        console.log('Settings saved:', settings);
        alert('Settings saved!');
        this.clearInfo();
    }

    clearInfo() {
        document.getElementById('game-info').innerHTML = '';
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    window.tmaGame = new TMAGame();
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TMAGame;
}
