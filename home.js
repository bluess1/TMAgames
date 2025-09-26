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
        
        // Add basic styling
        this.addStyles();
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
        console.log('Starting game...');
        // TODO: Implement game start logic
        // This would typically redirect to game.html or initialize game state
        alert('Game starting! (Implement your game logic here)');
    }

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

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .home-container {
                background: rgba(255, 255, 255, 0.9);
                padding: 2rem;
                border-radius: 15px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 400px;
                width: 90%;
            }

            .game-title {
                color: #333;
                font-size: 2.5rem;
                margin-bottom: 1rem;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
            }

            .welcome-section p {
                color: #666;
                margin: 0.5rem 0;
            }

            .menu-section {
                margin: 2rem 0;
            }

            .menu-button {
                display: block;
                width: 100%;
                padding: 12px 20px;
                margin: 10px 0;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1.1rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .menu-button:hover, .menu-button:focus {
                background: #5a6fd8;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                outline: none;
            }

            .info-section {
                margin-top: 1rem;
                padding: 1rem;
                background: rgba(0, 0, 0, 0.05);
                border-radius: 8px;
                min-height: 50px;
            }

            .leaderboard, .settings, .about {
                text-align: left;
                margin: 1rem 0;
            }

            .score-entry {
                padding: 8px;
                margin: 5px 0;
                background: rgba(255, 255, 255, 0.7);
                border-radius: 5px;
            }

            .settings label {
                display: block;
                margin: 10px 0;
            }

            .settings input {
                margin-right: 10px;
            }

            button {
                margin: 5px;
                padding: 8px 16px;
                border: none;
                border-radius: 5px;
                background: #28a745;
                color: white;
                cursor: pointer;
            }

            button:hover {
                background: #218838;
            }
        `;
        
        document.head.appendChild(style);
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
