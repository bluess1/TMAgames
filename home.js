// home.js - Ultra Simple Version (No Errors)
class TMAGame {
    constructor() {
        this.gameTitle = "TMA Game";
        this.init();
    }

    init() {
        this.createHomeLayout();
        this.setupEventListeners();
    }

    createHomeLayout() {
        document.body.innerHTML = `
            <div style="
                font-family: Arial, sans-serif;
                text-align: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 0;
                padding: 20px;
            ">
                <div style="
                    background: rgba(255, 255, 255, 0.95);
                    padding: 2rem;
                    border-radius: 20px;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                    max-width: 450px;
                    width: 90%;
                ">
                    <h1 style="
                        color: #333;
                        font-size: 2.8rem;
                        margin-bottom: 1rem;
                        background: linear-gradient(45deg, #667eea, #764ba2);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    ">${this.gameTitle}</h1>
                    
                    <p style="color: #666; margin-bottom: 2rem;">Welcome to TMA Game! Ready to play?</p>
                    
                    <button id="start-btn" style="
                        display: block;
                        width: 100%;
                        padding: 15px 25px;
                        margin: 12px 0;
                        background: linear-gradient(45deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        font-size: 1.2rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">🎮 Start Game</button>
                    
                    <button id="about-btn" style="
                        display: block;
                        width: 100%;
                        padding: 10px 20px;
                        margin: 12px 0;
                        background: #00b894;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 1rem;
                        cursor: pointer;
                    ">About</button>
                    
                    <div id="game-info" style="margin-top: 1rem;"></div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('about-btn').addEventListener('click', () => {
            this.showAbout();
        });
    }

    startGame() {
        const infoEl = document.getElementById('game-info');
        infoEl.innerHTML = `
            <h3 style="color: #333; margin: 20px 0;">Select Game Mode</h3>
            <button onclick="window.tmaGame.launchGame(false)" style="
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
            ">🎮 Single Player</button>
            <button onclick="window.tmaGame.launchGame(true)" style="
                display: block;
                width: 100%;
                padding: 15px;
                margin: 10px 0;
                background: linear-gradient(45deg, #fd79a8, #e84393);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1.1rem;
                cursor: pointer;
            ">👥 Multiplayer</button>
            <button onclick="window.tmaGame.clearInfo()" style="
                padding: 8px 16px;
                margin: 10px 0;
                background: #636e72;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Back</button>
        `;
    }

    launchGame(multiplayer) {
        console.log('Launching game with assets, multiplayer:', multiplayer);
        
        // Check if game.html exists, if not, create inline game
        const gameUrl = 'games/geometry-dash/game.html?mode=' + (multiplayer ? 'multi' : 'single');
        
        // Try to navigate to game.html
        fetch(gameUrl, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    // File exists, navigate to it
                    window.location.href = gameUrl;
                } else {
                    // File doesn't exist, create inline game
                    console.log('game.html not found, creating inline game');
                    this.createInlineGame(multiplayer);
                }
            })
            .catch(() => {
                // Error checking, create inline game
                console.log('Creating inline game');
                this.createInlineGame(multiplayer);
            });
    }

    createInlineGame(multiplayer) {
        document.body.innerHTML = `
            <div style="
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
                min-height: 100vh;
                margin: 0;
                padding: 0;
            ">
                <div style="
                    background: linear-gradient(135deg, #2d3436 0%, #636e72 100%);
                    padding: 15px 20px;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <button onclick="location.reload()" style="
                        padding: 10px 15px;
                        background: #ff6b6b;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    ">🏠 Home</button>
                    <h2 style="margin: 0;">Geometry Dash ${multiplayer ? '- Multiplayer' : ''}</h2>
                    <div style="color: #ddd; font-size: 0.9rem;">With Asset Loading!</div>
                </div>
                
                <div style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: calc(100vh - 70px);
                    padding: 20px;
                ">
                    <canvas id="gameCanvas" style="
                        border: 3px solid #2d3436;
                        border-radius: 15px;
                        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                        background: linear-gradient(180deg, #87CEEB 0%, #98FB98 100%);
                    "></canvas>
                </div>
            </div>
        `;
        
        // Load scripts dynamically
        this.loadGameScripts(multiplayer);
    }

    loadGameScripts(multiplayer) {
        console.log('Loading game scripts...');
        
        // Load physics.js
        const physicsScript = document.createElement('script');
        physicsScript.src = 'games/geometry-dash/physics.js';
        physicsScript.onload = () => {
            console.log('✅ Physics.js loaded');
            
            // Load multiplayer.js
            const multiplayerScript = document.createElement('script');
            multiplayerScript.src = 'games/geometry-dash/multiplayer.js';
            multiplayerScript.onload = () => {
                console.log('✅ Multiplayer.js loaded');
                
                // Load game.js
                const gameScript = document.createElement('script');
                gameScript.src = 'games/geometry-dash/game.js';
                gameScript.onload = () => {
                    console.log('✅ Game.js loaded');
                    console.log('✅ All scripts loaded! Game should start now.');
                };
                gameScript.onerror = () => {
                    console.error('❌ Failed to load game.js');
                    this.startFallbackGame(multiplayer);
                };
                document.body.appendChild(gameScript);
            };
            multiplayerScript.onerror = () => {
                console.error('❌ Failed to load multiplayer.js');
                this.startFallbackGame(multiplayer);
            };
            document.body.appendChild(multiplayerScript);
        };
        physicsScript.onerror = () => {
            console.error('❌ Failed to load physics.js');
            this.startFallbackGame(multiplayer);
        };
        document.body.appendChild(physicsScript);
    }

    startFallbackGame(multiplayer) {
        console.log('Starting fallback game (scripts not found)');
        
        const canvas = document.getElementById('gameCanvas');
        canvas.width = Math.min(800, window.innerWidth - 60);
        canvas.height = Math.min(400, window.innerHeight - 150);
        
        const ctx = canvas.getContext('2d');
        
        const game = {
            player: { x: 50, y: 260, width: 40, height: 40, vy: 0, grounded: true },
            obstacles: [],
            speed: 3,
            gravity: 0.8,
            jump: -15,
            ground: 300,
            state: 'play',
            camera: 0
        };

        for (let i = 300; i < 3000; i += 200 + Math.random() * 200) {
            game.obstacles.push({ x: i, y: 260, w: 40, h: 40 });
        }

        const jump = () => {
            if (game.player.grounded && game.state === 'play') {
                game.player.vy = game.jump;
                game.player.grounded = false;
            }
        };

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                jump();
            }
        });

        canvas.addEventListener('click', jump);

        const loop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (game.state === 'play') {
                if (!game.player.grounded) game.player.vy += game.gravity;
                game.player.y += game.player.vy;
                game.player.x += game.speed;
                
                if (game.player.y >= game.ground - game.player.height) {
                    game.player.y = game.ground - game.player.height;
                    game.player.vy = 0;
                    game.player.grounded = true;
                }
                
                game.camera = game.player.x - canvas.width / 4;
                
                for (let obs of game.obstacles) {
                    if (game.player.x < obs.x + obs.w &&
                        game.player.x + game.player.width > obs.x &&
                        game.player.y < obs.y + obs.h &&
                        game.player.y + game.player.height > obs.y) {
                        
                        game.state = 'dead';
                        setTimeout(() => {
                            game.player.x = 50;
                            game.player.y = 260;
                            game.player.vy = 0;
                            game.player.grounded = true;
                            game.camera = 0;
                            game.state = 'play';
                        }, 1000);
                        break;
                    }
                }
            }
            
            ctx.save();
            ctx.translate(-game.camera, 0);
            
            ctx.fillStyle = '#2D3436';
            ctx.fillRect(0, game.ground, 3000, 100);
            
            ctx.fillStyle = game.state === 'dead' ? '#FF7675' : '#FF6B6B';
            ctx.fillRect(game.player.x, game.player.y, game.player.width, game.player.height);
            
            ctx.fillStyle = '#2D3436';
            for (let obs of game.obstacles) {
                ctx.beginPath();
                ctx.moveTo(obs.x + obs.w/2, obs.y);
                ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
                ctx.lineTo(obs.x, obs.y + obs.h);
                ctx.closePath();
                ctx.fill();
            }
            
            ctx.restore();
            
            ctx.fillStyle = '#2D3436';
            ctx.font = '20px Arial';
            const progress = Math.floor((game.player.x / 3000) * 100);
            ctx.fillText('Progress: ' + progress + '%', 20, 30);
            ctx.fillText('SPACE or Click to Jump!', 20, 60);
            ctx.fillText('Fallback Mode (Add asset files!)', 20, 90);
            
            if (multiplayer) {
                ctx.fillText('Multiplayer Mode', 20, 120);
            }
            
            if (game.state === 'dead') {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'white';
                ctx.font = '48px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('DEAD', canvas.width/2, canvas.height/2);
                ctx.textAlign = 'left';
            }
            
            requestAnimationFrame(loop);
        };
        
        loop();
    }

    showAbout() {
        const infoEl = document.getElementById('game-info');
        infoEl.innerHTML = `
            <h3 style="color: #333;">About TMA Game</h3>
            <p style="color: #666;">A fun Geometry Dash style game with asset loading!</p>
            <p style="color: #999; font-size: 0.9rem;">Add your images and audio to assets/ folder</p>
            <button onclick="window.tmaGame.clearInfo()" style="
                padding: 8px 16px;
                background: #636e72;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Close</button>
        `;
    }

    clearInfo() {
        document.getElementById('game-info').innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.tmaGame = new TMAGame();
});
