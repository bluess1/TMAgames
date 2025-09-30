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
        
        // Network optimization
        this.updateBuffer = [];
        this.lastSentUpdate = 0;
        this.updateRate = 1000 / 30; // 30 FPS network updates
        
        // Lag compensation
        this.serverTimeOffset = 0;
        this.rtt = 0; // Round trip time
        
        this.init();
    }

    init() {
        console.log('Multiplayer Manager initialized');
        console.log('Player ID:', this.playerId);
    }

    // Generate unique player ID
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 12) + '_' + Date.now();
    }

    // Connect to multiplayer server
    async connect(serverUrl = 'ws://localhost:3001') {
        try {
            console.log('Attempting to connect to multiplayer server...');

            // --- CHANGED: The simulation is removed and the real WebSocket code is now active. ---
            this.socket = new WebSocket(serverUrl);
            
            this.socket.onopen = (event) => {
                console.log('✅ Connected to multiplayer server');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.setupSocketEvents();
                this.startPingPong();
                this.joinRoom(); // Automatically join a default room on connect
            };
            
            this.socket.onclose = (event) => {
                console.log('Disconnected from server');
                this.handleDisconnection();
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.handleConnectionError(error);
            };
            
        } catch (error) {
            console.error('Failed to connect to multiplayer server:', error);
            this.handleConnectionError(error);
        }
    }

    // Setup WebSocket event handlers
    setupSocketEvents() {
        if (!this.socket) return;

        this.socket.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleServerMessage(data);
            } catch (error) {
                console.error('Error parsing server message:', error);
            }
        });
    }

    // Handle messages from server
    handleServerMessage(data) {
        switch (data.type) {
            case 'playerJoined':
                this.addPlayer(data.player);
                break;
                
            case 'playerLeft':
                this.removePlayer(data.playerId);
                break;
                
            case 'gameStateUpdate': // A common message type for receiving all player positions
                if (data.players) {
                    data.players.forEach(playerState => {
                        this.updatePlayer(playerState.id, playerState);
                    });
                }
                break;

            case 'playerUpdate': // Handle updates for a single player
                this.updatePlayer(data.playerId, data.update);
                break;
                
            case 'playerJump':
                this.handlePlayerJump(data.playerId, data.timestamp);
                break;
                
            case 'playerDied':
                this.handlePlayerDeath(data.playerId);
                break;
                
            case 'roomJoined':
                this.roomId = data.roomId;
                // Add all players already in the room
                if (data.players) {
                    data.players.forEach(playerData => this.addPlayer(playerData));
                }
                this.updateUI();
                break;
                
            case 'ping':
                this.handlePing(data.timestamp);
                break;
                
            case 'pong':
                this.handlePong(data.timestamp);
                break;
                
            default:
                console.log('Unknown message type:', data.type);
        }
    }

    // Add a new player
    addPlayer(playerData) {
        if (playerData.id === this.playerId || this.players.has(playerData.id)) return; // Don't add ourselves or duplicates
        
        const player = {
            id: playerData.id,
            name: playerData.name || `Player ${playerData.id.slice(-4)}`,
            x: playerData.x || 100,
            y: playerData.y || this.game.groundY - 40,
            width: 40,
            height: 40,
            velocityY: 0,
            isGrounded: true,
            color: playerData.color || this.getRandomColor(),
            trail: [],
            alive: true,
            lastUpdate: Date.now()
        };
        
        this.players.set(playerData.id, player);
        console.log(`Player ${player.name} joined the game`);
        
        // Add to game players array
        if (this.game.players) {
            this.game.players.push(player);
        }
        
        this.updateUI();
    }

    // Remove a player
    removePlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            console.log(`Player ${player.name} left the game`);
            this.players.delete(playerId);
            
            // Remove from game players array
            if (this.game.players) {
                this.game.players = this.game.players.filter(p => p.id !== playerId);
            }
            
            this.updateUI();
        }
    }

    // Update player position/state
    updatePlayer(playerId, update) {
        if (playerId === this.playerId) return; // Never update the local player from server data directly

        const player = this.players.get(playerId);
        if (player) {
            // Simple interpolation can be added here later if needed
            player.x = update.x;
            player.y = update.y;
            player.velocityY = update.velocityY || 0;
            player.isGrounded = update.isGrounded;
            player.alive = update.alive;
            player.lastUpdate = Date.now();
        }
    }

    // Handle player jump
    handlePlayerJump(playerId, timestamp) {
        const player = this.players.get(playerId);
        if (player && player.alive && player.isGrounded) {
            this.game.physics.jump(player); // Use the physics engine for consistency
            this.game.playSound('jump');
        }
    }

    // Handle player death
    handlePlayerDeath(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            player.alive = false;
            if (this.game.createExplosionParticles) {
                this.game.createExplosionParticles(player.x, player.y);
            }
        }
    }

    // Send player update to server
    sendPlayerUpdate() {
        if (!this.isConnected || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        const now = Date.now();
        if (now - this.lastSentUpdate < this.updateRate) return;

        const localPlayer = this.game.players?.find(p => p.isLocal);
        if (!localPlayer) return;

        const update = {
            type: 'playerUpdate',
            // No longer sending playerId, server should know who we are from our connection
            timestamp: now,
            x: localPlayer.x,
            y: localPlayer.y,
            velocityY: localPlayer.velocityY,
            isGrounded: localPlayer.isGrounded,
            alive: localPlayer.alive
        };

        this.socket.send(JSON.stringify(update));
        this.lastSentUpdate = now;
    }

    // Send jump event to server
    sendJump() {
        if (!this.isConnected || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        this.socket.send(JSON.stringify({ type: 'playerJump' }));
    }

    // Send death event to server
    sendDeath() {
        if (!this.isConnected || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        
        this.socket.send(JSON.stringify({ type: 'playerDied' }));
    }

    // Join a multiplayer room
    joinRoom(roomId = 'default') {
        if (!this.isConnected || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        this.socket.send(JSON.stringify({ type: 'joinRoom', roomId }));
    }
    
    // (The rest of the methods: createRoom, startPingPong, handlePing, handlePong, handleDisconnection, handleConnectionError, updateUI, getRandomColor, disconnect, getStatus are mostly fine and can remain as they are)
    // ... [ The rest of your unchanged methods go here ] ...
    // NOTE: For brevity, I'm omitting the rest of the file which doesn't require changes. 
    // Just replace the top part of your file down to here.
}

    // Create a new room
    createRoom() {
        if (!this.isConnected || !this.socket) {
            console.log('Not connected to server');
            return;
        }

        const message = {
            type: 'createRoom',
            playerId: this.playerId
        };

        this.socket.send(JSON.stringify(message));
    }

    // Start ping-pong for latency measurement
    startPingPong() {
        this.pingInterval = setInterval(() => {
            if (this.isConnected && this.socket) {
                const message = {
                    type: 'ping',
                    timestamp: Date.now()
                };
                this.socket.send(JSON.stringify(message));
            }
        }, 5000); // Ping every 5 seconds
    }

    // Handle ping from server
    handlePing(timestamp) {
        if (!this.socket) return;

        const message = {
            type: 'pong',
            timestamp: timestamp
        };

        this.socket.send(JSON.stringify(message));
    }

    // Handle pong from server
    handlePong(originalTimestamp) {
        this.rtt = Date.now() - originalTimestamp;
        console.log(`RTT: ${this.rtt}ms`);
    }

    // Handle disconnection
    handleDisconnection() {
        this.isConnected = false;
        
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }

        // Clear all remote players
        this.players.clear();
        if (this.game.players) {
            this.game.players = this.game.players.filter(p => p.isLocal);
        }

        // Attempt reconnection
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
        } else {
            console.log('Max reconnection attempts reached');
        }

        this.updateUI();
    }

    // Handle connection errors
    handleConnectionError(error) {
        console.error('Connection error:', error);
        // For demo, just continue with single player
        this.isConnected = false;
    }

    // Update UI elements
    updateUI() {
        const multiplayerInfo = document.getElementById('multiplayer-info');
        const playerCount = document.getElementById('player-count');
        const roomIdEl = document.getElementById('room-id');

        if (multiplayerInfo && playerCount) {
            if (this.isConnected) {
                multiplayerInfo.style.display = 'block';
                playerCount.textContent = `Players: ${this.players.size + 1}`;
                if (roomIdEl && this.roomId) {
                    roomIdEl.textContent = `Room: ${this.roomId}`;
                }
            } else {
                multiplayerInfo.style.display = 'none';
            }
        }
    }

    // Bot simulation for demo
    startBotSimulation() {
        setInterval(() => {
            this.players.forEach(player => {
                if (player.isBot && player.alive) {
                    // Move bot forward
                    player.x += this.game.gameSpeed * 0.8;
                    
                    // Random jumping
                    if (Math.random() < 0.02 && player.isGrounded) {
                        player.velocityY = this.game.jumpPower;
                        player.isGrounded = false;
                    }
                    
                    // Apply physics
                    if (!player.isGrounded) {
                        player.velocityY += this.game.gravity;
                    }
                    
                    player.y += player.velocityY;
                    
                    if (player.y >= this.game.groundY - player.height) {
                        player.y = this.game.groundY - player.height;
                        player.velocityY = 0;
                        player.isGrounded = true;
                    }
                    
                    // Reset if too far behind
                    const localPlayer = this.game.players?.find(p => p.isLocal);
                    if (localPlayer && player.x < localPlayer.x - 500) {
                        player.x = localPlayer.x + Math.random() * 200 - 100;
                        player.y = this.game.groundY - player.height;
                        player.velocityY = 0;
                        player.isGrounded = true;
                        player.alive = true;
                    }
                }
            });
        }, 1000 / 60);
    }

    // Get random player color
    getRandomColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F06292'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Clean up multiplayer connections
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
        
        this.isConnected = false;
        this.players.clear();
        
        console.log('Disconnected from multiplayer server');
    }

    // Get connection status
    getStatus() {
        return {
            connected: this.isConnected,
            playerId: this.playerId,
            roomId: this.roomId,
            playerCount: this.players.size + 1,
            rtt: this.rtt
        };
    }
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.MultiplayerManager = MultiplayerManager;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiplayerManager;
}
