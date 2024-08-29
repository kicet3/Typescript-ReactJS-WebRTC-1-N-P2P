const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const rooms = {};  // 방 정보를 저장할 객체
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);
  socket.on("join_room", (data) => {
    const roomName = data.room;
    socket.join(roomName);
    console.log(`Client ${socket.id} joined room ${roomName}`);
    if (!rooms[roomName]) {
      rooms[roomName] = [];
    }
    rooms[roomName].push(socket.id);
    const otherUsers = rooms[roomName].filter((id) => id !== socket.id);
    // 방에 있는 다른 사용자 목록을 클라이언트에게 전송
    socket.emit("all_users", otherUsers);
    // 다른 사용자에게 방에 새로운 사용자가 들어왔음을 알림
    socket.to(roomName).emit("new_user", socket.id);
  });
  socket.on("offer", (sdp) => {
    console.log(`Sending offer from ${socket.id}`);
    socket.broadcast.emit("getOffer", sdp);
  });
  socket.on("answer", (sdp) => {
    console.log(`Sending answer from ${socket.id}`);
    socket.broadcast.emit("getAnswer", sdp);
  });
  socket.on("candidate", (candidate) => {
    console.log(`Sending candidate from ${socket.id}`);
    socket.broadcast.emit("getCandidate", candidate);
  });
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    // 방 목록에서 사용자를 제거
    for (const roomName in rooms) {
      rooms[roomName] = rooms[roomName].filter((id) => id !== socket.id);
      if (rooms[roomName].length === 0) {
        delete rooms[roomName];
      }
    }
  });
});
server.listen(4000, () => {
  console.log("Server is running on port 4000");
});