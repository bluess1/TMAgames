// WebSocket connection (add to multiplayer.js)
const socket = io('bluess1.github.io/tmagames/');

socket.on('playerJoined', (playerData) => {
    // Add remote player
});

socket.on('playerUpdate', (playerData) => {
    // Update remote player position
});
