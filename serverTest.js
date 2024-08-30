const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid'); // Unique ID 생성기
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = {};

wss.on('connection', (ws) => {
  const id = uuidv4(); // Unique ID 할당
  clients[id] = ws; // 연결된 클라이언트를 저장

  console.log(`Client connected: ${id}`);

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log(`Received message: ${message}`);
    
    switch (data.action) {
      case 'offer':
      case 'answer':
      case 'iceCandidate':
        // 다른 클라이언트에게 메시지 브로드캐스트
        Object.keys(clients).forEach((clientId) => {
          if (clientId !== id) {
            clients[clientId].send(JSON.stringify(data));
          }
        });
        break;
      default:
        break;
    }
  });

  ws.on('close', () => {
    delete clients[id];
    console.log(`Client disconnected: ${id}`);
  });
});

server.listen(4000, () => {
  console.log('Server is listening on http://13.125.72.99:4000');
});