// home.js - TMA Game Home Page
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
        console.log('Launching game with all assets, multiplayer:', multiplayer);
        
        // Navigate directly to game.html
        const gameUrl = 'games/geometry-dash/game.html?mode=' + (multiplayer ? 'multi' : 'single');
        window.location.href = gameUrl;
    }

    showAbout() {
        const infoEl = document.getElementById('game-info');
        infoEl.innerHTML = `
            <h3 style="color: #333;">About TMA Game</h3>
            <p style="color: #666;">A fun Geometry Dash style game with full asset support!</p>
            <p style="color: #999; font-size: 0.9rem;">Features physics engine, multiplayer, and custom assets</p>
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
