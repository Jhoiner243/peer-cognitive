const io = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('process-query', { prompt: 'Hello, tell me a short story with [node:1] annotations.' });
});

socket.on('stream-text', (data) => {
    process.stdout.write(data);
});

socket.on('stream-raw', (data) => {
    // console.log('RAW CAHUNK:', data);
});

socket.on('stream-finish', () => {
    console.log('\nStream finished');
    socket.disconnect();
});

socket.on('error', (err) => {
    console.error('Error:', err);
});

socket.on('disconnect', () => {
    console.log('Disconnected');
});
