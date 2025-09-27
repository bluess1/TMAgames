// home.js - TMA Game Home Page
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
        
        // Add to body (or replace existing content)
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
            `Welcome to ${this.gameTitle}!`,
            'Ready to challenge yourself?',
            'Use arrow keys to navigate and Enter to select.'
        ];
        
        welcomeEl.innerHTML = messages.map(msg => `<p>${msg}</p>`).join('');
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

    launchGeometryDash(multiplayer = false) {
        console.log('🎮 Launching Geometry Dash...', { multiplayer });
        
        // Hide current menu
        document.body.innerHTML = `
            <div id="game-header">
                <button onclick="window.location.reload()" style="
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    padding: 10px 15px;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    z-index: 1000;
                ">🏠 Home</button>
                <h2 style="text-align: center; margin: 20px 0; color: white;">
                    Geometry Dash ${multiplayer ? '- Multiplayer' : '- Single Player'}
                </h2>
            </div>
            <div id="game-container" style="display: flex; justify-content: center; align-items: center;">
                <canvas id="gameCanvas" style="border: 2px solid #333; border-radius: 10px;"></canvas>
            </div>
        `;
        
        console.log('✅ HTML updated, loading game...');
        
        // Load and start the geometry dash game
        setTimeout(() => {
            this.loadGeometryDash(multiplayer);
        }, 100); // Small delay to ensure DOM is updated
    }

    async loadGeometryDash(multiplayer) {
        try {
            // In a real setup, you'd load from games/geometry-dash/game.js
            // For now, we'll create the game directly
            
            // Add game styles
            const gameStyle = document.createElement('style');
            gameStyle.textContent = `
                #game-header {
                    position: relative;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 10px 0;
                    margin-bottom: 20px;
                }
                
                #game-container {
                    min-height: calc(100vh - 100px);
                    background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
                    padding: 20px;
                }
                
                .game-mode-btn {
                    display: block;
                    width: 100%;
                    padding: 15px;
                    margin: 10px 0;
                    background: linear-gradient(45deg, #00b894, #00cec9);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .game-mode-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 184, 148, 0.4);
                }
            `;
            document.head.appendChild(gameStyle);
            
            // Initialize the geometry dash game
            // Note: In production, you'd import this from a separate file
            if (typeof GeometryDashGame !== 'undefined') {
                const game = new GeometryDashGame();
                if (multiplayer) {
                    game.startGame(true);
                }
            } else {
                console.log('Geometry Dash game loaded successfully!');
                console.log('Game would start here with multiplayer =', multiplayer);
                
                // For demo - show game interface
                const canvas = document.getElementById('gameCanvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 1000;
                canvas.height = 500;
                
                // Demo game screen
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = '#2D3436';
                ctx.fillRect(0, 400, canvas.width, 100);
                
                ctx.fillStyle = '#FF6B6B';
                ctx.fillRect(50, 360, 40, 40);
                
                ctx.fillStyle = '#2D3436';
                ctx.font = 'bold 24px Arial';
                ctx.fillText('Geometry Dash Demo', 50, 50);
                ctx.font = '18px Arial';
                ctx.fillText('Click or press SPACE to jump!', 50, 80);
                ctx.fillText(`Mode: ${multiplayer ? 'Multiplayer' : 'Single Player'}`, 50, 110);
                
                // Add simple jump demo
                let playerY = 360;
                let velocity = 0;
                let isGrounded = true;
                
                const gameLoop = () => {
                    // Draw player
                    ctx.fillStyle = '#FF6B6B';
                    ctx.fillRect(50, playerY, 40, 40);
                    
                    // Draw UI
                    ctx.fillStyle = '#2D3436';
                    ctx.font = 'bold 24px Arial';
                    ctx.fillText('Geometry Dash Demo', 50, 50);
                    ctx.font = '18px Arial';
                    ctx.fillText('Click or press SPACE to jump!', 50, 80);
                    ctx.fillText(`Mode: ${multiplayer ? 'Multiplayer' : 'Single Player'}`, 50, 110);
                    
                    requestAnimationFrame(gameLoop);
                };
                
                // Add jump controls
                const handleJump = () => {
                    if (isGrounded) {
                        velocity = -15;
                        isGrounded = false;
                    }
                };
                
                canvas.addEventListener('click', handleJump);
                document.addEventListener('keydown', (e) => {
                    if (e.code === 'Space') {
                        e.preventDefault();
                        handleJump();
                    }
                });
                
                gameLoop();
            }
            
        } catch (error) {
            console.error('Failed to load Geometry Dash:', error);
            alert('Failed to load game. Please try again.');
        }
    } Clear and redraw
                    ctx.fillStyle = '#87CEEB';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    ctx.fillStyle = '#2D3436';
                    ctx.fillRect(0, 400, canvas.width, 100);
                    
                    // Update player
                    if (!isGrounded) {
                        velocity += 0.8; // gravity
                    }
                    
                    playerY += velocity;
                    
                    if (playerY >= 360) {
                        playerY = 360;
                        velocity = 0;
                        isGrounded = true;
                    }
                    
                    //

    showLeaderboard() {
        console.log('Showing leaderboard...');
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
        console.log('Showing settings...');
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
        console.log('Showing about...');
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
        // Save settings to localStorage
        const settings = {
            sound: document.getElementById('sound-toggle')?.checked || false,
            music: document.getElementById('music-toggle')?.checked || false,
            difficulty: document.getElementById('difficulty')?.value || 3
        };
        
        localStorage.setItem('tmagame-settings', JSON.stringify(settings));
        alert('Settings saved!');
        this.clearInfo();
    }

    clearInfo() {
        document.getElementById('game-info').innerHTML = '';
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tmaGame = new TMAGame();
});

// Export for module use (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TMAGame;
}
