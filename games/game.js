// games/geometry-dash/game.js - Multiplayer Geometry Dash Game
class GeometryDashGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.isMultiplayer = false;
        this.players = [];
        this.obstacles = [];
        this.coins = [];
        this.particles = [];
        this.camera = { x: 0, y: 0 };
        this.level = null;
        this.gameSpeed = 5;
        this.gravity = 0.8;
        this.jumpPower = -15;
        this.groundY = 0;
        
        // Audio system
        this.audioContext = null;
        this.sounds = {};
        this.music = null;
        
        // Multiplayer
        this.socket = null;
        this.roomId = null;
        this.playerId = this.generatePlayerId();
        
        // Game loop
        this.lastTime = 0;
        this.animationId = null;
        
        this.init();
    }

    async init() {
        this.setupCanvas();
        this.setupControls();
        this.setupAudio();
        await this.loadAssets();
        this.setupMultiplayer();
        this.createLevel();
        this.startGameLoop();
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
                jump: { frequency: 220, duration: 0.1, type: 'square' },
                death: { frequency: 110, duration: 0.3, type: 'sawtooth' },
                coin: { frequency: 440, duration: 0.2, type: 'sine' },
                checkpoint: { frequency: 330, duration: 0.2, type: 'triangle' }
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
            coins: this.generateCoinSprite(),
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

    generateCoinSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 30;
        canvas.height = 30;
        const ctx = canvas.getContext('2d');
        
        // Gold coin
        ctx.fillStyle = '#F1C40F';
        ctx.beginPath();
        ctx.arc(15, 15, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner circle
        ctx.fillStyle = '#F39C12';
        ctx.beginPath();
        ctx.arc(15, 15, 8, 0, Math.PI * 2);
        ctx.fill();
        
        return canvas;
    }

    generateParticleSprites() {
        // Simple particle effects
        return {
            trail: '#74B9FF',
            explosion: '#FF7675',
            coin: '#FDCB6E'
        };
    }

    createLevel() {
        // Create a simple level with obstacles and coins
        this.level = {
            length: 5000,
            obstacles: [],
            coins: [],
            checkpoints: []
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
        
        // Generate coins
        for (let x = 400; x < this.level.length; x += 150 + Math.random() * 200) {
            this.level.coins.push({
                x: x,
                y: this.groundY - 80 - Math.random() * 100,
                width: 30,
                height: 30,
                collected: false,
                rotation: 0
            });
        }
        
        // Generate checkpoints
        for (let x = 1000; x < this.level.length; x += 1000) {
            this.level.checkpoints.push({
                x: x,
                y: this.groundY - 60,
                width: 20,
                height: 60,
                activated: false
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
            score: 0,
            alive: true,
            lastCheckpoint: { x: 100, y: this.groundY - 40 }
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
            this.playSound('jump');
            
            // Send jump to other players
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
        
        // Update coins rotation
        this.level.coins.forEach(coin => {
            coin.rotation += 0.05;
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
        // Obstacle collisions
        this.level.obstacles.forEach(obstacle => {
            if (this.isColliding(player, obstacle)) {
                this.playerDie(player);
            }
        });
        
        // Coin collisions
        this.level.coins.forEach(coin => {
            if (!coin.collected && this.isColliding(player, coin)) {
                coin.collected = true;
                player.score += 100;
                this.playSound('coin');
                this.createCoinParticles(coin.x, coin.y);
            }
        });
        
        // Checkpoint collisions
        this.level.checkpoints.forEach(checkpoint => {
            if (!checkpoint.activated && this.isColliding(player, checkpoint)) {
                checkpoint.activated = true;
                player.lastCheckpoint = { x: checkpoint.x, y: player.y };
                this.playSound('checkpoint');
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
        
        // Respawn after delay
        setTimeout(() => {
            player.x = player.lastCheckpoint.x;
            player.y = player.lastCheckpoint.y;
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
        
        // Render obstacles
        this.level.obstacles.forEach(obstacle => {
            this.ctx.drawImage(this.assets.obstacles[obstacle.type], obstacle.x, obstacle.y);
        });
        
        // Render coins
        this.level.coins.forEach(coin => {
            if (!coin.collected) {
                this.ctx.save();
                this.ctx.translate(coin.x + coin.width/2, coin.y + coin.height/2);
                this.ctx.rotate(coin.rotation);
                this.ctx.drawImage(this.assets.coins, -coin.width/2, -coin.height/2);
                this.ctx.restore();
            }
        });
        
        // Render checkpoints
        this.level.checkpoints.forEach(checkpoint => {
            this.ctx.fillStyle = checkpoint.activated ? '#00B894' : '#636E72';
            this.ctx.fillRect(checkpoint.x, checkpoint.y, checkpoint.width, checkpoint.height);
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
            // Score
            this.ctx.fillStyle = '#2D3436';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillText(`Score: ${localPlayer.score}`, 20, 40);
            
            // Progress bar
            const progress = localPlayer.x / this.level.length;
            const barWidth = 200;
            this.ctx.fillStyle = '#DDD';
            this.ctx.fillRect(20, 60, barWidth, 10);
            this.ctx.fillStyle = '#00B894';
            this.ctx.fillRect(20, 60, barWidth * progress, 10);
        }
        
        // Multiplayer info
        if (this.isMultiplayer) {
            this.ctx.fillStyle = '#2D3436';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(`Players: ${this.players.length}`, 20, 100);
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
    createCoinParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x + Math.random() * 20,
                y: y + Math.random() * 20,
                velocityX: (Math.random() - 0.5) * 10,
                velocityY: (Math.random() - 0.5) * 10,
                size: 3,
                color: '#FDCB6E',
                alpha: 1,
                decay: 0.02
            });
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
