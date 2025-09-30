// games/geometry-dash/multiplayer.js - Multiplayer functionality
class MultiplayerManager {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.socket = null;
        this.isConnected = false;
        this.playerId = this.generatePlayerId();
        this.roomId = null;
        this.players = new Map();
        this.pingInterval = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.updateBuffer = [];
        this.lastSentUpdate = 0;
        this.updateRate = 1000 / 30; // 30 FPS network updates
        this.serverTimeOffset = 0;
        this.rtt = 0; // Round trip time
    }

    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 12);
    }

    connect(serverUrl = 'wss://your-public-server-url.glitch.me') { // IMPORTANT: REPLACE WITH YOUR SERVER URL
        return new Promise((resolve, reject) => {
            try {
                if (!serverUrl || serverUrl.includes('your-public-server-url')) {
                    throw new Error("Server URL is not configured. Please update it in multiplayer.js.");
                }
                this.socket = new WebSocket(serverUrl);

                this.socket.onopen = () => {
                    console.log("WebSocket connection opened.");
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.setupSocketEvents();
                    this.startPingPong();
                    this.joinRoom();
                    resolve();
                };

                this.socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(new Error("WebSocket connection failed."));
                };

                this.socket.onclose = () => {
                    if (!this.isConnected) {
                        reject(new Error("Connection closed before establishment. Check server URL and if the server is running."));
                    }
                    this.handleDisconnection();
                };

            } catch (error) {
                console.error("Caught error while creating WebSocket:", error);
                reject(error);
            }
        });
    }

    setupSocketEvents() {
        this.socket.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleServerMessage(data);
            } catch (error) {
                console.error('Error parsing server message:', error);
            }
        });
    }

    handleServerMessage(data) {
        switch (data.type) {
            case 'playerJoined': this.addPlayer(data.player); break;
            case 'playerLeft': this.removePlayer(data.playerId); break;
            case 'gameStateUpdate': data.players.forEach(p => this.updatePlayer(p.id, p)); break;
            case 'playerUpdate': this.updatePlayer(data.playerId, data.update); break;
            case 'playerJump': this.handlePlayerJump(data.playerId); break;
            case 'playerDied': this.handlePlayerDeath(data.playerId); break;
            case 'roomJoined':
                this.roomId = data.roomId;
                if (data.players) data.players.forEach(p => this.addPlayer(p));
                this.updateUI();
                break;
            case 'ping': this.handlePing(data.timestamp); break;
            case 'pong': this.handlePong(data.timestamp); break;
            default: console.log('Unknown message type:', data.type);
        }
    }

    addPlayer(playerData) {
        if (playerData.id === this.playerId || this.game.players.some(p => p.id === playerData.id)) return;
        
        const player = this.game.createPlayer(playerData.id, false);
        player.x = playerData.x || 100;
        player.y = playerData.y || this.game.groundY - 40;
        this.game.players.push(player);
        console.log(`Player ${playerData.id} joined the game`);
        this.updateUI();
    }

    removePlayer(playerId) {
        const initialLength = this.game.players.length;
        this.game.players = this.game.players.filter(p => p.id !== playerId);
        if (this.game.players.length < initialLength) {
            console.log(`Player ${playerId} left the game`);
            this.updateUI();
        }
    }

    updatePlayer(playerId, update) {
        if (playerId === this.playerId) return;
        const player = this.game.players.find(p => p.id === playerId);
        if (player) {
            player.x = update.x;
            player.y = update.y;
            player.alive = update.alive;
        }
    }

    handlePlayerJump(playerId) {
        const player = this.game.players.find(p => p.id === playerId);
        if (player && player.alive && player.isGrounded) {
            this.game.physics.jump(player);
            this.game.playSound('jump');
        }
    }

    handlePlayerDeath(playerId) {
        const player = this.game.players.find(p => p.id === playerId);
        if (player) {
            player.alive = false;
            this.game.createExplosionParticles(player.x, player.y);
        }
    }

    sendPlayerUpdate() {
        if (!this.isConnected || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        const now = Date.now();
        if (now - this.lastSentUpdate < this.updateRate) return;
        const localPlayer = this.game.players.find(p => p.isLocal);
        if (!localPlayer) return;
        this.socket.send(JSON.stringify({ type: 'playerUpdate', x: localPlayer.x, y: localPlayer.y, alive: localPlayer.alive }));
        this.lastSentUpdate = now;
    }

    sendJump() {
        if (!this.isConnected || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        this.socket.send(JSON.stringify({ type: 'playerJump' }));
    }

    sendDeath() {
        if (!this.isConnected || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        this.socket.send(JSON.stringify({ type: 'playerDied' }));
    }

    joinRoom(roomId = 'default') {
        if (!this.isConnected || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        this.socket.send(JSON.stringify({ type: 'joinRoom', roomId }));
    }

    startPingPong() {
        this.pingInterval = setInterval(() => {
            if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
            }
        }, 5000);
    }

    handlePing(timestamp) {
        if (this.socket) this.socket.send(JSON.stringify({ type: 'pong', timestamp }));
    }

    handlePong(originalTimestamp) {
        this.rtt = Date.now() - originalTimestamp;
    }

    handleDisconnection() {
        this.isConnected = false;
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.game.players = this.game.players.filter(p => p.isLocal);
        console.log("Disconnected from server.");
        // Reconnect logic can go here if desired
        this.updateUI();
    }

    updateUI() {
        const playerCountEl = document.getElementById('player-count');
        if (playerCountEl) {
            playerCountEl.textContent = `Players: ${this.game.players.length}`;
        }
    }
    
    disconnect() {
        if (this.pingInterval) clearInterval(this.pingInterval);
        if (this.socket) this.socket.close();
        this.isConnected = false;
        console.log('Manually disconnected.');
    }
}
