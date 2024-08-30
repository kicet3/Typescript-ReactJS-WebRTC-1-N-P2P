const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');  // Unique ID 생성기

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = {};  // 연결된 클라이언트 저장소

wss.on('connection', (ws) => {
  const id = uuidv4();  // Unique ID 할당
  clients[id] = ws;  // 연결된 클라이언트를 저장

  console.log(`Client connected: ${id}`);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Received message from ${id}:`, data);
      
      switch (data.action) {
        case 'offer':
        case 'answer':
        case 'iceCandidate':
          // 다른 모든 클라이언트에게 메시지 브로드캐스트
          broadcastExceptSender(id, message);
          break;
        default:
          console.warn('Unknown action:', data.action);
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.on('close', () => {
    delete clients[id];
    console.log(`Client disconnected: ${id}`);
  });
});

// 서버 브로드캐스트 함수 (발신자를 제외하고 모든 클라이언트에게 전송)
function broadcastExceptSender(senderId, message) {
  Object.keys(clients).forEach((clientId) => {
    if (clientId !== senderId) {
      try {
        clients[clientId].send(message);
      } catch (error) {
        console.error(`Error sending message to client ${clientId}:`, error);
      }
    }
  });
}

server.listen(4000, () => {
  console.log('Server is listening on http://192.168.1.67:3030');
});