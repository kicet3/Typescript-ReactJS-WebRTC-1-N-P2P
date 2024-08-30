const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 4000 });

let clients = [];

server.on('connection', (socket) => {
  console.log('New client connected');
  
  clients.push(socket);

  socket.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('Received message:', message);

    switch (message.action) {
      case 'offer':
        sendToOtherClient(socket, message);
        break;
      case 'answer':
        sendToOtherClient(socket, message);
        break;
      case 'iceCandidate':
        sendToOtherClient(socket, message);
        break;
      default:
        break;
    }
  });

  socket.on('close', () => {
    console.log('Client disconnected');
    clients = clients.filter(client => client !== socket);
  });
});

const sendToOtherClient = (sender, message) => {
  clients.forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

console.log('WebSocket server is running on ws://localhost:4000');