// WebSocket connection (add to multiplayer.js)
const socket = io('https://bluess1.github.io/TMAgames');

socket.on('playerJoined', (playerData) => {
    // Add remote player
});

socket.on('playerUpdate', (playerData) => {
    // Update remote player position
});
