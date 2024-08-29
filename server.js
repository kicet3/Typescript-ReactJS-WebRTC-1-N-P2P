const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  
  io.on("connection", (socket) => {
    console.log("New client connected", socket.id);
  
    socket.on("join_room", (data) => {
      const roomName = data.room;
      socket.join(roomName);
      console.log(`Client with ID: ${socket.id} joined room: ${roomName}`);
  
      const allUsers = io.sockets.adapter.rooms.get(roomName);
      if (allUsers) {
        const usersArray = Array.from(allUsers);
        socket.emit("all_users", usersArray);
      }
    });
  
    socket.on("offer", (sdp) => {
      const roomName = "1234";  // 예시로 고정된 룸 이름
      socket.to(roomName).emit("getOffer", sdp);
    });
  
    socket.on("answer", (sdp) => {
      const roomName = "1234";
      socket.to(roomName).emit("getAnswer", sdp);
    });
  
    socket.on("candidate", (candidate) => {
      const roomName = "1234";
      socket.to(roomName).emit("getCandidate", candidate);
    });
  
    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });