// WebSocket connection (add to multiplayer.js)
const socket = io('your-server-url');

socket.on('playerJoined', (playerData) => {
    // Add remote player
});

socket.on('playerUpdate', (playerData) => {
    // Update remote player position
});
