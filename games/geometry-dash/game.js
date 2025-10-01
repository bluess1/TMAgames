// games/geometry-dash/game.js - Multiplayer Geometry Dash Game (Using All Assets)
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
        
        // Use the PhysicsEngine from physics.js
        this.physics = new PhysicsEngine();
        
        // Use the MultiplayerManager from multiplayer.js
        this.multiplayerManager = null;
        
        // Audio system
        this.audioContext = null;
        this.sounds = {};
        
        // Game loop
        this.lastTime = 0;
        this.animationId = null;
        
        this.init();
    }

    async init() {
        console.log('Initializing Geometry Dash with all assets...');
        
        this.setupCanvas();
        this.setupControls();
        this.setupAudio();
        await this.loadAssets();
        this.createLevel();
        
        // Check for multiplayer mode from URL
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        
        if (mode === 'multi') {
            this.isMultiplayer = true;
            this.multiplayerManager = new MultiplayerManager(this);
            await this.multiplayerManager.connect();
        }
        
        // Hide menu and start game
        const menuScreen = document.getElementById('menu-screen');
        if (menuScreen) {
            menuScreen.style.display = 'none';
        }
        
        this.startGameLoop();
        this.startGame// games/geometry-dash/game.js - Multiplayer Geometry Dash Game
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
        
        // Asset storage
        this.images = {};
        this.audio = {};
        this.assetsLoaded = false;
        
        // Use the PhysicsEngine from physics.js
        this.physics = new PhysicsEngine();
        
        // Use the MultiplayerManager from multiplayer.js
        this.multiplayerManager = null;
        
        // Audio system
        this.audioContext = null;
        
        // Game loop
        this.lastTime = 0;
        this.animationId = null;
        
        console.log('🎮 GeometryDashGame constructor called');
        this.init();
    }

    async init() {
        console.log('🎮 Initializing Geometry Dash with all assets...');
        
        this.setupCanvas();
        this.setupControls();
        this.setupAudio();
        await this.loadAssets();
        this.createLevel();
        
        // Check for multiplayer mode from URL
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        
        console.log('🎮 Mode from URL:', mode);
        
        if (mode === 'multi') {
            this.isMultiplayer = true;
            this.multiplayerManager = new MultiplayerManager(this);
            await this.multiplayerManager.connect();
        }
        
        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        // Hide menu and start game
        const menuScreen = document.getElementById('menu-screen');
        if (menuScreen) {
            menuScreen.style.display = 'none';
        }
        
        this.startGameLoop();
        this.startGame(this.isMultiplayer);
        
        console.log('✅ Game initialization complete!');
    }

    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('❌ Canvas not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        console.log('✅ Canvas setup complete');
    }

    resizeCanvas() {
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
            
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.handleJump();
            }
            
            if (e.code === 'Escape') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        this.canvas.addEventListener('click', () => {
            this.handleJump();
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleJump();
        });
        
        console.log('✅ Controls setup complete');
    }

    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('✅ Audio context created');
        } catch (error) {
            console.warn('⚠️ Audio not supported:', error);
        }
    }

    async loadAssets() {
        console.log('📦 Loading assets from files...');
        
        const assetPaths = {
            // Player images
            playerCube: '../../assets/images/player/cube.png',
            
            // Obstacle images
            obstacleSpike: '../../assets/images/obstacles/spike.png',
            obstacleBlock: '../../assets/images/obstacles/block.png',
            
            // Background images
            background: '../../assets/images/backgrounds/gradient.png',
            
            // UI images
            uiIcons: '../../assets/images/ui/icons.png',
            
            // Audio files
            sfxJump: '../../assets/audio/sfx/jump.mp3',
            sfxDeath: '../../assets/audio/sfx/death.mp3',
            musicMenu: '../../assets/audio/music/menu.mp3',
            musicLevel: '../../assets/audio/music/level1.mp3'
        };
        
        // Load images
        const imagePromises = [];
        const imageKeys = ['playerCube', 'obstacleSpike', 'obstacleBlock', 'background', 'uiIcons'];
        
        imageKeys.forEach(key => {
            const promise = new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.images[key] = img;
                    console.log('✅ Loaded image:', key);
                    resolve();
                };
                img.onerror = () => {
                    console.warn('⚠️ Failed to load image:', key, '- using fallback');
                    this.images[key] = this.createFallbackImage(key);
                    resolve();
                };
                img.src = assetPaths[key];
            });
            imagePromises.push(promise);
        });
        
        // Load audio
        const audioPromises = [];
        const audioKeys = ['sfxJump', 'sfxDeath', 'musicMenu', 'musicLevel'];
        
        audioKeys.forEach(key => {
            const promise = new Promise((resolve) => {
                const audio = new Audio();
                audio.oncanplaythrough = () => {
                    this.audio[key] = audio;
                    console.log('✅ Loaded audio:', key);
                    resolve();
                };
                audio.onerror = () => {
                    console.warn('⚠️ Failed to load audio:', key);
                    resolve();
                };
                audio.src = assetPaths[key];
                audio.load();
            });
            audioPromises.push(promise);
        });
        
        // Wait for all assets to load
        await Promise.all([...imagePromises, ...audioPromises]);
        
        this.assetsLoaded = true;
        console.log('✅ All assets loaded!');
    }

    createFallbackImage(type) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        switch(type) {
            case 'playerCube':
                canvas.width = 40;
                canvas.height = 40;
                ctx.fillStyle = '#FF6B6B';
                ctx.fillRect(0, 0, 40, 40);
                ctx.strokeStyle = '#D63031';
                ctx.lineWidth = 2;
                ctx.strokeRect(0, 0, 40, 40);
                break;
                
            case 'obstacleSpike':
                canvas.width = 40;
                canvas.height = 40;
                ctx.fillStyle = '#2D3436';
                ctx.beginPath();
                ctx.moveTo(20, 0);
                ctx.lineTo(40, 40);
                ctx.lineTo(0, 40);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'obstacleBlock':
                canvas.width = 40;
                canvas.height = 40;
                ctx.fillStyle = '#2D3436';
                ctx.fillRect(0, 0, 40, 40);
                break;
                
            case 'background':
                canvas.width = 1;
                canvas.height = 1;
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(0, 0, 1, 1);
                break;
                
            default:
                canvas.width = 1;
                canvas.height = 1;
                break;
        }
        
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }

    playSound(soundName) {
        // Try to play from loaded audio files first
        const audioMap = {
            'jump': 'sfxJump',
            'death': 'sfxDeath'
        };
        
        const audioKey = audioMap[soundName];
        if (audioKey && this.audio[audioKey]) {
            const audio = this.audio[audioKey].cloneNode();
            audio.volume = 0.3;
            audio.play().catch(e => console.warn('⚠️ Audio play failed:', e));
            return;
        }
        
        // Fallback to Web Audio API
        if (!this.audioContext) return;
        
        const soundDefs = {
            death: { frequency: 110, duration: 0.3, type: 'sawtooth' }
        };
        
        const soundDef = soundDefs[soundName];
        if (!soundDef) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(soundDef.frequency, this.audioContext.currentTime);
        oscillator.type = soundDef.type;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + soundDef.duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + soundDef.duration);
    }

    createLevel() {
        this.level = {
            length: 5000,
            obstacles: []
        };
        
        for (let x = 500; x < this.level.length; x += 200 + Math.random() * 300) {
            this.level.obstacles.push({
                x: x,
                y: this.groundY - 40,
                width: 40,
                height: 40,
                type: 'spike'
            });
        }
        
        console.log('✅ Level created with', this.level.obstacles.length, 'obstacles');
    }

    createPlayer(playerId, isLocal = false) {
        return {
            id: playerId,
            x: 100,
            y: this.groundY - 40,
            width: 40,
            height: 40,
            velocityY: 0,
            isGrounded: false,
            isLocal: isLocal,
            color: isLocal ? '#FF6B6B' : '#74B9FF',
            trail: [],
            alive: true,
            startX: 100
        };
    }

    handleJump() {
        if (this.gameState !== 'playing') {
            return;
        }
        
        const localPlayer = this.players.find(p => p.isLocal);
        if (localPlayer && localPlayer.alive && localPlayer.isGrounded) {
            this.physics.jump(localPlayer);
            this.playSound('jump');
            
            if (this.isMultiplayer && this.multiplayerManager) {
                this.multiplayerManager.sendJump();
            }
        }
    }

    startGame(multiplayer = false) {
        this.gameState = 'playing';
        this.isMultiplayer = multiplayer;
        
        const playerId = 'player_' + Math.random().toString(36).substr(2, 12);
        this.players = [this.createPlayer(playerId, true)];
        
        console.log('🎮 Game started!', { multiplayer, playerId });
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        this.players.forEach(player => {
            if (!player.alive) return;
            
            // Use physics engine
            this.physics.updateEntity(player, this.groundY);
            
            if (player.isLocal) {
                this.camera.x = player.x - this.canvas.width / 4;
                player.x += this.gameSpeed;
            }
            
            this.checkCollisions(player);
            
            player.trail.push({ x: player.x, y: player.y, time: Date.now() });
            player.trail = player.trail.filter(t => Date.now() - t.time < 500);
        });
        
        this.updateParticles(deltaTime);
        
        const localPlayer = this.players.find(p => p.isLocal);
        if (localPlayer && localPlayer.x >= this.level.length) {
            this.winGame();
        }
    }

    checkCollisions(player) {
        this.level.obstacles.forEach(obstacle => {
            if (this.physics.checkCollision(player, obstacle)) {
                this.playerDie(player);
            }
        });
    }

    playerDie(player) {
        if (!player.alive) return;
        
        player.alive = false;
        this.playSound('death');
        this.createExplosionParticles(player.x, player.y);
        
        setTimeout(() => {
            player.x = player.startX;
            player.y = this.groundY - 40;
            player.velocityY = 0;
            player.alive = true;
        }, 1000);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        if (this.images.background) {
            this.ctx.drawImage(this.images.background, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#98FB98');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.ctx.save();
        this.ctx.translate(-this.camera.x, 0);
        
        this.renderLevel();
        this.renderPlayers();
        this.renderParticles();
        
        this.ctx.restore();
        
        this.renderUI();
    }

    renderLevel() {
        // Ground
        this.ctx.fillStyle = '#2D3436';
        this.ctx.fillRect(0, this.groundY, this.level.length, 100);
        
        // Obstacles
        this.level.obstacles.forEach(obstacle => {
            const obstacleImage = this.images.obstacleSpike || this.images.obstacleBlock;
            if (obstacleImage) {
                this.ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            } else {
                this.ctx.fillStyle = '#2D3436';
                this.ctx.beginPath();
                this.ctx.moveTo(obstacle.x + obstacle.width/2, obstacle.y);
                this.ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
                this.ctx.lineTo(obstacle.x, obstacle.y + obstacle.height);
                this.ctx.closePath();
                this.ctx.fill();
            }
        });
    }

    renderPlayers() {
        this.players.forEach(player => {
            if (!player.alive) return;
            
            // Trail
            player.trail.forEach((point, index) => {
                const alpha = index / player.trail.length;
                this.ctx.fillStyle = 'rgba(116, 185, 255, ' + (alpha * 0.3) + ')';
                this.ctx.fillRect(point.x, point.y, 5, 5);
            });
            
            // Player
            if (this.images.playerCube) {
                this.ctx.drawImage(this.images.playerCube, player.x, player.y, player.width, player.height);
            } else {
                this.ctx.fillStyle = player.isLocal ? '#FF6B6B' : player.color;
                this.ctx.fillRect(player.x, player.y, player.width, player.height);
            }
        });
    }

    renderParticles() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });
        this.ctx.globalAlpha = 1;
    }

    renderUI() {
        const localPlayer = this.players.find(p => p.isLocal);
        if (localPlayer) {
            const progress = localPlayer.x / this.level.length;
            const barWidth = 200;
            
            this.ctx.fillStyle = '#2D3436';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillText('Progress:', 20, 35);
            
            this.ctx.fillStyle = '#DDD';
            this.ctx.fillRect(20, 45, barWidth, 15);
            this.ctx.fillStyle = '#00B894';
            this.ctx.fillRect(20, 45, barWidth * progress, 15);
            
            this.ctx.fillStyle = '#2D3436';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(Math.floor(progress * 100) + '%', 230, 57);
        }
        
        if (this.isMultiplayer) {
            this.ctx.fillStyle = '#2D3436';
            this.ctx.font = '16px Arial';
            this.ctx.fillText('Players: ' + this.players.length, 20, 85);
        }
    }

    createExplosionParticles(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x + Math.random() * 30,
                y: y + Math.random() * 30,
                velocityX: (Math.random() - 0.5) * 15,
                velocityY: (Math.random() - 0.5) * 15,
                size: 4,
                color: '#FF7675',
                alpha: 1,
                decay: 0.03
            });
        }
    }

    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.alpha -= particle.decay;
            return particle.alpha > 0;
        });
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
        }
    }

    winGame() {
        this.gameState = 'gameOver';
        console.log('🏆 Level completed!');
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    startGameLoop() {
        console.log('🔄 Starting game loop...');
        this.gameLoop(0);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        if (this.multiplayerManager) {
            this.multiplayerManager.disconnect();
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, creating game instance...');
    window.geometryDashGame = new GeometryDashGame();
    console.log('✅ Game instance created and available globally');
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeometryDashGame;
}

console.log('✅ game.js loaded successfully');(this.isMultiplayer);
    }

    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }
        
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
            
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.handleJump();
            }
            
            if (e.code === 'Escape') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        this.canvas.addEventListener('click', () => {
            this.handleJump();
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleJump();
        });
    }

    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Audio not supported:', error);
        }
    }

    async loadAssets() {
        console.log('Loading assets from files...');
        
        const assetPaths = {
            // Player images
            playerCube: '../../assets/images/player/cube.png',
            
            // Obstacle images
            obstacleSpike: '../../assets/images/obstacles/spike.png',
            obstacleBlock: '../../assets/images/obstacles/block.png',
            
            // Background images
            background: '../../assets/images/backgrounds/gradient.png',
            
            // UI images
            uiIcons: '../../assets/images/ui/icons.png',
            
            // Audio files
            sfxJump: '../../assets/audio/sfx/jump.mp3',
            sfxDeath: '../../assets/audio/sfx/death.mp3',
            musicMenu: '../../assets/audio/music/menu.mp3',
            musicLevel: '../../assets/audio/music/level1.mp3'
        };
        
        // Load images
        const imagePromises = [];
        const imageKeys = ['playerCube', 'obstacleSpike', 'obstacleBlock', 'background', 'uiIcons'];
        
        imageKeys.forEach(key => {
            const promise = new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.images[key] = img;
                    console.log(`✅ Loaded image: ${key}`);
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`⚠️ Failed to load image: ${key}, using fallback`);
                    this.images[key] = this.createFallbackImage(key);
                    resolve();
                };
                img.src = assetPaths[key];
            });
            imagePromises.push(promise);
        });
        
        // Load audio
        const audioPromises = [];
        const audioKeys = ['sfxJump', 'sfxDeath', 'musicMenu', 'musicLevel'];
        
        audioKeys.forEach(key => {
            const promise = new Promise((resolve) => {
                const audio = new Audio();
                audio.oncanplaythrough = () => {
                    this.audio[key] = audio;
                    console.log(`✅ Loaded audio: ${key}`);
                    resolve();
                };
                audio.onerror = () => {
                    console.warn(`⚠️ Failed to load audio: ${key}`);
                    resolve();
                };
                audio.src = assetPaths[key];
                audio.load();
            });
            audioPromises.push(promise);
        });
        
        // Wait for all assets to load
        await Promise.all([...imagePromises, ...audioPromises]);
        
        this.assetsLoaded = true;
        console.log('✅ All assets loaded!');
    }

    createFallbackImage(type) {
        // Create fallback canvas-based images if files don't exist
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        switch(type) {
            case 'playerCube':
                canvas.width = 40;
                canvas.height = 40;
                ctx.fillStyle = '#FF6B6B';
                ctx.fillRect(0, 0, 40, 40);
                ctx.strokeStyle = '#D63031';
                ctx.lineWidth = 2;
                ctx.strokeRect(0, 0, 40, 40);
                break;
                
            case 'obstacleSpike':
                canvas.width = 40;
                canvas.height = 40;
                ctx.fillStyle = '#2D3436';
                ctx.beginPath();
                ctx.moveTo(20, 0);
                ctx.lineTo(40, 40);
                ctx.lineTo(0, 40);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'obstacleBlock':
                canvas.width = 40;
                canvas.height = 40;
                ctx.fillStyle = '#2D3436';
                ctx.fillRect(0, 0, 40, 40);
                break;
                
            case 'background':
                canvas.width = 1;
                canvas.height = 1;
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(0, 0, 1, 1);
                break;
                
            default:
                canvas.width = 1;
                canvas.height = 1;
                break;
        }
        
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }

    playSound(soundName) {
        // Try to play from loaded audio files first
        const audioMap = {
            'jump': 'sfxJump',
            'death': 'sfxDeath'
        };
        
        const audioKey = audioMap[soundName];
        if (audioKey && this.audio[audioKey]) {
            const audio = this.audio[audioKey].cloneNode();
            audio.volume = 0.3;
            audio.play().catch(e => console.warn('Audio play failed:', e));
            return;
        }
        
        // Fallback to Web Audio API
        if (!this.audioContext) return;
        
        const soundDefs = {
            death: { frequency: 110, duration: 0.3, type: 'sawtooth' }
        };
        
        const soundDef = soundDefs[soundName];
        if (!soundDef) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(soundDef.frequency, this.audioContext.currentTime);
        oscillator.type = soundDef.type;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + soundDef.duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + soundDef.duration);
    }

    createLevel() {
        this.level = {
            length: 5000,
            obstacles: []
        };
        
        for (let x = 500; x < this.level.length; x += 200 + Math.random() * 300) {
            this.level.obstacles.push({
                x: x,
                y: this.groundY - 40,
                width: 40,
                height: 40,
                type: 'spike'
            });
        }
    }

    createPlayer(playerId, isLocal = false) {
        return {
            id: playerId,
            x: 100,
            y: this.groundY - 40,
            width: 40,
            height: 40,
            velocityY: 0,
            isGrounded: false,
            isLocal: isLocal,
            color: isLocal ? '#FF6B6B' : '#74B9FF',
            trail: [],
            alive: true,
            startX: 100
        };
    }

    handleJump() {
        if (this.gameState !== 'playing') {
            if (this.gameState === 'menu') {
                this.startGame();
            }
            return;
        }
        
        const localPlayer = this.players.find(p => p.isLocal);
        if (localPlayer && localPlayer.alive && localPlayer.isGrounded) {
            this.physics.jump(localPlayer);
            this.playSound('jump');
            
            if (this.isMultiplayer && this.multiplayerManager) {
                this.multiplayerManager.sendJump();
            }
        }
    }

    startGame(multiplayer = false) {
        this.gameState = 'playing';
        this.isMultiplayer = multiplayer;
        
        const playerId = 'player_' + Math.random().toString(36).substr(2, 12);
        this.players = [this.createPlayer(playerId, true)];
        
        console.log('Game started!', { multiplayer, playerId });
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        this.players.forEach(player => {
            if (!player.alive) return;
            
            // Use physics engine
            this.physics.updateEntity(player, this.groundY);
            
            if (player.isLocal) {
                this.camera.x = player.x - this.canvas.width / 4;
                player.x += this.gameSpeed;
            }
            
            this.checkCollisions(player);
            
            player.trail.push({ x: player.x, y: player.y, time: Date.now() });
            player.trail = player.trail.filter(t => Date.now() - t.time < 500);
        });
        
        this.updateParticles(deltaTime);
        
        const localPlayer = this.players.find(p => p.isLocal);
        if (localPlayer && localPlayer.x >= this.level.length) {
            this.winGame();
        }
    }

    checkCollisions(player) {
        this.level.obstacles.forEach(obstacle => {
            if (this.physics.checkCollision(player, obstacle)) {
                this.playerDie(player);
            }
        });
    }

    playerDie(player) {
        if (!player.alive) return;
        
        player.alive = false;
        this.playSound('death');
        this.createExplosionParticles(player.x, player.y);
        
        setTimeout(() => {
            player.x = player.startX;
            player.y = this.groundY - 40;
            player.velocityY = 0;
            player.alive = true;
        }, 1000);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background image if loaded
        if (this.images.background) {
            this.ctx.drawImage(this.images.background, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Fallback gradient
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#98FB98');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.ctx.save();
        this.ctx.translate(-this.camera.x, 0);
        
        this.renderLevel();
        this.renderPlayers();
        this.renderParticles();
        
        this.ctx.restore();
        
        this.renderUI();
        
        if (this.gameState === 'menu') {
            this.renderMenu();
        }
    }

    renderLevel() {
        // Render ground
        this.ctx.fillStyle = '#2D3436';
        this.ctx.fillRect(0, this.groundY, this.level.length, 100);
        
        // Render obstacles using loaded images
        this.level.obstacles.forEach(obstacle => {
            const obstacleImage = this.images.obstacleSpike || this.images.obstacleBlock;
            if (obstacleImage) {
                this.ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            } else {
                // Fallback spike drawing
                this.ctx.fillStyle = '#2D3436';
                this.ctx.beginPath();
                this.ctx.moveTo(obstacle.x + obstacle.width/2, obstacle.y);
                this.ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
                this.ctx.lineTo(obstacle.x, obstacle.y + obstacle.height);
                this.ctx.closePath();
                this.ctx.fill();
            }
        });
    }

    renderPlayers() {
        this.players.forEach(player => {
            if (!player.alive) return;
            
            // Render trail
            player.trail.forEach((point, index) => {
                const alpha = index / player.trail.length;
                this.ctx.fillStyle = `rgba(116, 185, 255, ${alpha * 0.3})`;
                this.ctx.fillRect(point.x, point.y, 5, 5);
            });
            
            // Render player using loaded image
            if (this.images.playerCube) {
                this.ctx.drawImage(this.images.playerCube, player.x, player.y, player.width, player.height);
            } else {
                // Fallback player drawing
                this.ctx.fillStyle = player.isLocal ? '#FF6B6B' : player.color;
                this.ctx.fillRect(player.x, player.y, player.width, player.height);
            }
        });
    }

    renderParticles() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });
        this.ctx.globalAlpha = 1;
    }

    renderUI() {
        const localPlayer = this.players.find(p => p.isLocal);
        if (localPlayer) {
            const progress = localPlayer.x / this.level.length;
            const barWidth = 200;
            
            this.ctx.fillStyle = '#2D3436';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillText('Progress:', 20, 35);
            
            this.ctx.fillStyle = '#DDD';
            this.ctx.fillRect(20, 45, barWidth, 15);
            this.ctx.fillStyle = '#00B894';
            this.ctx.fillRect(20, 45, barWidth * progress, 15);
            
            this.ctx.fillStyle = '#2D3436';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`${Math.floor(progress * 100)}%`, 230, 57);
        }
        
        if (this.isMultiplayer) {
            this.ctx.fillStyle = '#2D3436';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`Players: ${this.players.length}`, 20, 85);
        }
    }

    renderMenu() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Geometry Dash', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Click or Press SPACE to Start', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.ctx.textAlign = 'left';
    }

    createExplosionParticles(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x + Math.random() * 30,
                y: y + Math.random() * 30,
                velocityX: (Math.random() - 0.5) * 15,
                velocityY: (Math.random() - 0.5) * 15,
                size: 4,
                color: '#FF7675',
                alpha: 1,
                decay: 0.03
            });
        }
    }

    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.alpha -= particle.decay;
            return particle.alpha > 0;
        });
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
        }
    }

    winGame() {
        this.gameState = 'gameOver';
        console.log('Level completed!');
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    startGameLoop() {
        this.gameLoop(0);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        if (this.multiplayerManager) {
            this.multiplayerManager.disconnect();
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.geometryDashGame = new GeometryDashGame();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeometryDashGame;
}

    setupCanvas() {
        // Create canvas if it doesn't exist
        this.canvas = document.getElementById('gameCanvas') || this.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Set canvas background
        this.canvas.style.background = 'linear-gradient(180deg, #87CEEB 0%, #98FB98 100%)';
    }

    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = 'gameCanvas';
        canvas.style.border = '2px solid #333';
        canvas.style.borderRadius = '10px';
        document.body.appendChild(canvas);
        return canvas;
    }

    resizeCanvas() {
        const container = this.canvas.parentElement || document.body;
        const maxWidth = Math.min(window.innerWidth - 40, 1200);
        const maxHeight = Math.min(window.innerHeight - 100, 600);
        
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        this.groundY = maxHeight - 100;
        
        // Update camera bounds
        this.camera.bounds = {
            width: maxWidth,
            height: maxHeight
        };
    }

    setupControls() {
        // Keyboard controls
        this.keys = {};
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.handleJump();
            }
            
            if (e.code === 'Escape') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse/touch controls
        this.canvas.addEventListener('click', (e) => {
            this.handleJump();
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleJump();
        });
    }

    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Define sound effects with fallback to simple beeps
            this.soundDefs = {
                death: { frequency: 110, duration: 0.3, type: 'sawtooth' }
            };
            
        } catch (error) {
            console.warn('Audio not supported:', error);
        }
    }

    async loadAssets() {
        // For now, we'll use programmatically generated assets
        // In production, you'd load actual image/audio files
        
        this.assets = {
            player: this.generatePlayerSprite(),
            obstacles: this.generateObstacleSprites(),
            particles: this.generateParticleSprites()
        };
        
        console.log('Assets loaded successfully');
    }

    generatePlayerSprite() {
        // Generate a simple cube sprite
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');
        
        // Main cube
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(2, 2, 36, 36);
        
        // Border
        ctx.strokeStyle = '#D63031';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, 36, 36);
        
        // Inner highlight
        ctx.fillStyle = '#FF8E8E';
        ctx.fillRect(6, 6, 28, 28);
        
        return canvas;
    }

    generateObstacleSprites() {
        const sprites = {};
        
        // Spike obstacle
        const spike = document.createElement('canvas');
        spike.width = 40;
        spike.height = 40;
        const spikeCtx = spike.getContext('2d');
        
        spikeCtx.fillStyle = '#2D3436';
        spikeCtx.beginPath();
        spikeCtx.moveTo(20, 0);
        spikeCtx.lineTo(40, 40);
        spikeCtx.lineTo(0, 40);
        spikeCtx.closePath();
        spikeCtx.fill();
        
        sprites.spike = spike;
        return sprites;
    }

    generateParticleSprites() {
        // Simple particle effects
        return {
            trail: '#74B9FF',
            explosion: '#FF7675'
        };
    }

    createLevel() {
        // Create a simple level with obstacles only
        this.level = {
            length: 5000,
            obstacles: []
        };
        
        // Generate obstacles
        for (let x = 500; x < this.level.length; x += 200 + Math.random() * 300) {
            this.level.obstacles.push({
                x: x,
                y: this.groundY - 40,
                width: 40,
                height: 40,
                type: 'spike'
            });
        }
    }

    createPlayer(playerId, isLocal = false) {
        return {
            id: playerId,
            x: 100,
            y: this.groundY - 40,
            width: 40,
            height: 40,
            velocityY: 0,
            isGrounded: false,
            isLocal: isLocal,
            color: isLocal ? '#FF6B6B' : '#74B9FF',
            trail: [],
            alive: true,
            startX: 100
        };
    }

    handleJump() {
        if (this.gameState !== 'playing') {
            if (this.gameState === 'menu') {
                this.startGame();
            }
            return;
        }
        
        const localPlayer = this.players.find(p => p.isLocal);
        if (localPlayer && localPlayer.alive && localPlayer.isGrounded) {
            localPlayer.velocityY = this.jumpPower;
            localPlayer.isGrounded = false;
            
            // Send jump to other players (no sound)
            if (this.isMultiplayer && this.socket) {
                this.socket.emit('playerJump', {
                    playerId: this.playerId,
                    timestamp: Date.now()
                });
            }
        }
    }

    startGame(multiplayer = false) {
        this.gameState = 'playing';
        this.isMultiplayer = multiplayer;
        
        // Create local player
        this.players = [this.createPlayer(this.playerId, true)];
        
        if (multiplayer) {
            this.joinMultiplayerRoom();
        }
        
        console.log('Game started!', { multiplayer, playerId: this.playerId });
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update players
        this.players.forEach(player => {
            if (!player.alive) return;
            
            // Apply gravity
            if (!player.isGrounded) {
                player.velocityY += this.gravity;
            }
            
            // Update position
            player.y += player.velocityY;
            
            // Ground collision
            if (player.y >= this.groundY - player.height) {
                player.y = this.groundY - player.height;
                player.velocityY = 0;
                player.isGrounded = true;
            }
            
            // Move camera with local player
            if (player.isLocal) {
                this.camera.x = player.x - this.canvas.width / 4;
                player.x += this.gameSpeed;
            }
            
            // Check collisions
            this.checkCollisions(player);
            
            // Update trail effect
            player.trail.push({ x: player.x, y: player.y, time: Date.now() });
            player.trail = player.trail.filter(t => Date.now() - t.time < 500);
        });
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Check win condition
        const localPlayer = this.players.find(p => p.isLocal);
        if (localPlayer && localPlayer.x >= this.level.length) {
            this.winGame();
        }
    }

    checkCollisions(player) {
        // Obstacle collisions only
        this.level.obstacles.forEach(obstacle => {
            if (this.isColliding(player, obstacle)) {
                this.playerDie(player);
            }
        });
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    playerDie(player) {
        if (!player.alive) return;
        
        player.alive = false;
        this.playSound('death');
        this.createExplosionParticles(player.x, player.y);
        
        // Respawn after delay at start
        setTimeout(() => {
            player.x = player.startX;
            player.y = this.groundY - 40;
            player.velocityY = 0;
            player.alive = true;
        }, 1000);
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context for camera transform
        this.ctx.save();
        this.ctx.translate(-this.camera.x, 0);
        
        // Render level elements
        this.renderLevel();
        this.renderPlayers();
        this.renderParticles();
        
        // Restore context
        this.ctx.restore();
        
        // Render UI (not affected by camera)
        this.renderUI();
        
        if (this.gameState === 'menu') {
            this.renderMenu();
        }
    }

    renderLevel() {
        // Render ground
        this.ctx.fillStyle = '#2D3436';
        this.ctx.fillRect(0, this.groundY, this.level.length, 100);
        
        // Render obstacles only
        this.level.obstacles.forEach(obstacle => {
            this.ctx.drawImage(this.assets.obstacles[obstacle.type], obstacle.x, obstacle.y);
        });
    }

    renderPlayers() {
        this.players.forEach(player => {
            if (!player.alive) return;
            
            // Render trail
            player.trail.forEach((point, index) => {
                const alpha = index / player.trail.length;
                this.ctx.fillStyle = `rgba(116, 185, 255, ${alpha * 0.3})`;
                this.ctx.fillRect(point.x, point.y, 5, 5);
            });
            
            // Render player
            if (player.isLocal) {
                this.ctx.drawImage(this.assets.player, player.x, player.y);
            } else {
                // Remote player - different color
                this.ctx.fillStyle = player.color;
                this.ctx.fillRect(player.x, player.y, player.width, player.height);
            }
        });
    }

    renderParticles() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });
        this.ctx.globalAlpha = 1;
    }

    renderUI() {
        const localPlayer = this.players.find(p => p.isLocal);
        if (localPlayer) {
            // Progress bar
            const progress = localPlayer.x / this.level.length;
            const barWidth = 200;
            
            this.ctx.fillStyle = '#2D3436';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillText('Progress:', 20, 35);
            
            this.ctx.fillStyle = '#DDD';
            this.ctx.fillRect(20, 45, barWidth, 15);
            this.ctx.fillStyle = '#00B894';
            this.ctx.fillRect(20, 45, barWidth * progress, 15);
            
            // Progress percentage
            this.ctx.fillStyle = '#2D3436';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`${Math.floor(progress * 100)}%`, 230, 57);
        }
        
        // Multiplayer info
        if (this.isMultiplayer) {
            this.ctx.fillStyle = '#2D3436';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`Players: ${this.players.length}`, 20, 85);
        }
    }

    renderMenu() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Title
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Geometry Dash', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        // Instructions
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Click or Press SPACE to Start', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.ctx.textAlign = 'left';
    }

    // Additional methods for particles, audio, multiplayer...
    createExplosionParticles(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x + Math.random() * 30,
                y: y + Math.random() * 30,
                velocityX: (Math.random() - 0.5) * 15,
                velocityY: (Math.random() - 0.5) * 15,
                size: 4,
                color: '#FF7675',
                alpha: 1,
                decay: 0.03
            });
        }
    }

    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.alpha -= particle.decay;
            return particle.alpha > 0;
        });
    }

    playSound(soundName) {
        if (!this.audioContext) return;
        
        const soundDef = this.soundDefs[soundName];
        if (!soundDef) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(soundDef.frequency, this.audioContext.currentTime);
        oscillator.type = soundDef.type;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + soundDef.duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + soundDef.duration);
    }

    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }

    setupMultiplayer() {
        // Placeholder for multiplayer setup
        // You'd connect to a WebSocket server here
        console.log('Multiplayer setup ready');
    }

    joinMultiplayerRoom() {
        // Placeholder for joining multiplayer room
        console.log('Joining multiplayer room...');
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
        }
    }

    winGame() {
        this.gameState = 'gameOver';
        console.log('Level completed!');
        // Show win screen, save score, etc.
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    startGameLoop() {
        this.gameLoop(0);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.geometryDashGame = new GeometryDashGame();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeometryDashGame;
}
