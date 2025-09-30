// games/geometry-dash/game.js - Multiplayer Geometry Dash Game
class GeometryDashGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'menu';
        this.isMultiplayer = false;
        this.players = [];
        this.obstacles = [];
        this.particles = [];
        this.camera = { x: 0, y: 0 };
        this.level = null;
        this.gameSpeed = 5;
        this.groundY = 0;
        
        this.images = {};
        this.audio = {};
        this.assetsLoaded = false;
        
        this.physics = new PhysicsEngine();
        this.multiplayerManager = null;
        this.audioContext = null;
        
        this.lastTime = 0;
        this.animationId = null;
        
        this.init();
    }

    async init() {
        console.log('Initializing Geometry Dash...');
        this.setupCanvas();
        this.setupControls();
        this.setupAudio();
        await this.loadAssets();
        this.createLevel();
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) loadingScreen.style.display = 'none';
        this.startGameLoop();
        console.log('Game initialized and waiting at menu.');
    }

    async startGame(isMultiplayerMode) {
        if (this.gameState === 'playing') return;

        this.isMultiplayer = isMultiplayerMode;
        
        const menuScreen = document.getElementById('menu-screen');
        if (menuScreen) menuScreen.style.display = 'none';

        if (this.isMultiplayer) {
            this.multiplayerManager = new MultiplayerManager(this);
            try {
                console.log("Attempting to connect to multiplayer server...");
                await this.multiplayerManager.connect();
                console.log("✅ Connection successful!");

                const playerId = this.multiplayerManager.playerId;
                this.players = [this.createPlayer(playerId, true)];
                this.gameState = 'playing';
                console.log('Multiplayer game started!', { playerId });

            } catch (error) {
                console.error("❌ FAILED TO CONNECT TO MULTIPLAYER SERVER:", error);
                alert("Could not connect to the multiplayer server. Please check the console (F12) for details and ensure the server is running.");
                if (menuScreen) menuScreen.style.display = 'flex'; // Re-show the menu
                return;
            }
        } else {
            const playerId = 'player_single_' + Math.random().toString(36).substr(2, 9);
            this.players = [this.createPlayer(playerId, true)];
            this.gameState = 'playing';
            console.log('Single player game started!');
        }
    }

    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) return console.error('Canvas not found!');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = this.canvas.parentElement || document.body;
        const maxWidth = Math.min(window.innerWidth - 40, 1200);
        const maxHeight = Math.min(window.innerHeight - 150, 600);
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        this.groundY = maxHeight - 100;
    }

    setupControls() {
        this.keys = {};
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); this.handleJump(); }
            if (e.code === 'Escape') this.togglePause();
        });
        document.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
        this.canvas.addEventListener('click', () => this.handleJump());
        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.handleJump(); });
    }

    setupAudio() {
        try { this.audioContext = new (window.AudioContext || window.webkitAudioContext)(); }
        catch (error) { console.warn('Audio not supported:', error); }
    }

    async loadAssets() {
        console.log('Loading assets from files...');
        const assetPaths = { playerCube: '../../assets/images/player/cube.png', obstacleSpike: '../../assets/images/obstacles/spike.png', obstacleBlock: '../../assets/images/obstacles/block.png', background: '../../assets/images/backgrounds/gradient.png', uiIcons: '../../assets/images/ui/icons.png', sfxJump: '../../assets/audio/sfx/jump.mp3', sfxDeath: '../../assets/audio/sfx/death.mp3', musicMenu: '../../assets/audio/music/menu.mp3', musicLevel: '../../assets/audio/music/level1.mp3' };
        const imagePromises = []; const imageKeys = ['playerCube', 'obstacleSpike', 'obstacleBlock', 'background', 'uiIcons'];
        imageKeys.forEach(key => { const promise = new Promise((resolve) => { const img = new Image(); img.onload = () => { this.images[key] = img; resolve(); }; img.onerror = () => { this.images[key] = this.createFallbackImage(key); resolve(); }; img.src = assetPaths[key]; }); imagePromises.push(promise); });
        const audioPromises = []; const audioKeys = ['sfxJump', 'sfxDeath', 'musicMenu', 'musicLevel'];
        audioKeys.forEach(key => { const promise = new Promise((resolve) => { const audio = new Audio(); audio.oncanplaythrough = () => { this.audio[key] = audio; resolve(); }; audio.onerror = () => resolve(); audio.src = assetPaths[key]; audio.load(); }); audioPromises.push(promise); });
        await Promise.all([...imagePromises, ...audioPromises]); this.assetsLoaded = true; console.log('✅ All assets loaded!');
    }

    createFallbackImage(type) {
        const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
        switch(type) {
            case 'playerCube': canvas.width = 40; canvas.height = 40; ctx.fillStyle = '#FF6B6B'; ctx.fillRect(0, 0, 40, 40); break;
            case 'obstacleSpike': canvas.width = 40; canvas.height = 40; ctx.fillStyle = '#2D3436'; ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(40, 40); ctx.lineTo(0, 40); ctx.closePath(); ctx.fill(); break;
            default: canvas.width = 1; canvas.height = 1; break;
        }
        const img = new Image(); img.src = canvas.toDataURL(); return img;
    }

    playSound(soundName) {
        const audioMap = { 'jump': 'sfxJump', 'death': 'sfxDeath' };
        if (this.audio[audioMap[soundName]]) this.audio[audioMap[soundName]].cloneNode().play().catch(e => console.warn("Audio play failed:", e));
    }

    createLevel() {
        this.level = { length: 5000, obstacles: [] };
        for (let x = 500; x < this.level.length; x += 200 + Math.random() * 300) {
            this.level.obstacles.push({ x, y: this.groundY - 40, width: 40, height: 40, type: 'spike' });
        }
    }

    createPlayer(playerId, isLocal = false) {
        return { id: playerId, x: 100, y: this.groundY - 40, width: 40, height: 40, velocityY: 0, isGrounded: false, isLocal, color: isLocal ? '#FF6B6B' : '#74B9FF', trail: [], alive: true, startX: 100 };
    }

    handleJump() {
        if (this.gameState !== 'playing') return;
        const localPlayer = this.players.find(p => p.isLocal);
        if (localPlayer && localPlayer.alive && localPlayer.isGrounded) {
            this.physics.jump(localPlayer);
            this.playSound('jump');
            if (this.isMultiplayer && this.multiplayerManager) this.multiplayerManager.sendJump();
        }
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        this.players.forEach(player => {
            if (!player.alive) return;
            if (player.isLocal) {
                this.physics.updateEntity(player, this.groundY);
                player.x += this.gameSpeed;
                this.camera.x = player.x - this.canvas.width / 4;
                this.checkCollisions(player);
                if (player.x >= this.level.length) this.winGame();
            }
            player.trail.push({ x: player.x, y: player.y, time: Date.now() });
            player.trail = player.trail.filter(t => Date.now() - t.time < 500);
        });
        this.updateParticles(deltaTime);
    }

    checkCollisions(player) {
        this.level.obstacles.forEach(obstacle => {
            if (this.physics.checkCollision(player, obstacle)) this.playerDie(player);
        });
    }

    playerDie(player) {
        if (!player.alive) return;
        player.alive = false;
        this.playSound('death');
        this.createExplosionParticles(player.x, player.y);
        if (player.isLocal) {
            if (this.isMultiplayer && this.multiplayerManager) this.multiplayerManager.sendDeath();
            setTimeout(() => { player.x = player.startX; player.y = this.groundY - 40; player.velocityY = 0; player.alive = true; }, 1000);
        }
    }

    render() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.images.background) { this.ctx.drawImage(this.images.background, 0, 0, this.canvas.width, this.canvas.height); } else { const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height); gradient.addColorStop(0, '#87CEEB'); gradient.addColorStop(1, '#98FB98'); this.ctx.fillStyle = gradient; this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); }
        this.ctx.save(); this.ctx.translate(-this.camera.x, 0);
        this.renderLevel();
        this.renderPlayers();
        this.renderParticles();
        this.ctx.restore();
        this.renderUI();
    }

    renderLevel() {
        this.ctx.fillStyle = '#2D3436'; this.ctx.fillRect(0, this.groundY, this.level.length, 100);
        this.level.obstacles.forEach(obstacle => { const img = this.images.obstacleSpike; if (img) this.ctx.drawImage(img, obstacle.x, obstacle.y, obstacle.width, obstacle.height); });
    }

    renderPlayers() {
        this.players.forEach(player => {
            if (!player.alive) return;
            player.trail.forEach((p, i) => { const alpha = i / player.trail.length; this.ctx.fillStyle = `rgba(116, 185, 255, ${alpha * 0.3})`; this.ctx.fillRect(p.x, p.y, 5, 5); });
            const img = this.images.playerCube; if (img) this.ctx.drawImage(img, player.x, player.y, player.width, player.height);
        });
    }

    renderParticles() {
        this.particles.forEach(p => { this.ctx.fillStyle = p.color; this.ctx.globalAlpha = p.alpha; this.ctx.fillRect(p.x, p.y, p.size, p.size); });
        this.ctx.globalAlpha = 1;
    }

    renderUI() {
        const localPlayer = this.players.find(p => p.isLocal);
        if (localPlayer) {
            const progress = localPlayer.x / this.level.length; const barWidth = 200;
            this.ctx.fillStyle = '#2D3436'; this.ctx.font = 'bold 20px Arial'; this.ctx.fillText('Progress:', 20, 35);
            this.ctx.fillStyle = '#DDD'; this.ctx.fillRect(20, 45, barWidth, 15);
            this.ctx.fillStyle = '#00B894'; this.ctx.fillRect(20, 45, barWidth * progress, 15);
            this.ctx.fillStyle = '#2D3436'; this.ctx.font = '16px Arial'; this.ctx.fillText(`${Math.floor(progress * 100)}%`, 230, 57);
        }
        if (this.isMultiplayer) {
            this.ctx.fillStyle = '#2D3436'; this.ctx.font = '16px Arial'; this.ctx.fillText(`Players: ${this.players.length}`, 20, 85);
        }
    }

    createExplosionParticles(x, y) {
        for (let i = 0; i < 15; i++) { this.particles.push({ x: x + Math.random() * 30, y: y + Math.random() * 30, velocityX: (Math.random() - 0.5) * 15, velocityY: (Math.random() - 0.5) * 15, size: 4, color: '#FF7675', alpha: 1, decay: 0.03 }); }
    }

    updateParticles(deltaTime) {
        this.particles = this.particles.filter(p => { p.x += p.velocityX; p.y += p.velocityY; p.alpha -= p.decay; return p.alpha > 0; });
    }

    togglePause() {
        if (this.gameState === 'playing') this.gameState = 'paused';
        else if (this.gameState === 'paused') this.gameState = 'playing';
    }

    winGame() {
        this.gameState = 'gameOver'; console.log('Level completed!');
    }

    gameLoop(currentTime) {
        const deltaTime = (this.lastTime) ? currentTime - this.lastTime : 0; this.lastTime = currentTime;
        if (this.gameState !== 'menu') this.update(deltaTime);
        this.render();
        if (this.isMultiplayer && this.gameState === 'playing' && this.multiplayerManager) this.multiplayerManager.sendPlayerUpdate();
        this.animationId = requestAnimationFrame(time => this.gameLoop(time));
    }

    startGameLoop() {
        if (!this.animationId) this.animationId = requestAnimationFrame(time => this.gameLoop(time));
    }

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.audioContext) this.audioContext.close();
        if (this.multiplayerManager) this.multiplayerManager.disconnect();
    }
}
