let express = require('express');
let http = require('http');
let app = express();
let cors = require('cors');
let server = http.createServer(app);
let socketio = require('socket.io');
let io = socketio.listen(server);

app.use(cors());
const PORT = process.env.PORT || 4000;

let users = {};

let socketToRoom = {};

const maximum = process.env.MAXIMUM || 4;

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join-room', (roomId, email) => {
        console.log(`Client ${socket.id} joining room: ${roomId}`);
        
        if (!users[roomId]) {
            users[roomId] = [];
        }
    
        users[roomId].push({
            id: socket.id,
            email: email,
        });
    
        socketToRoom[socket.id] = roomId;
        socket.join(roomId);
    
        // Broadcast to other users in the room
        const otherUsers = users[roomId].filter(user => user.id !== socket.id);
        socket.emit('all_users', otherUsers); // 새로운 사용자에게 기존 사용자를 알려줌
        socket.to(roomId).emit('user-connected', { id: socket.id, email: email }); // 기존 사용자에게 새로운 사용자 연결됨을 알림
    });

    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Handle disconnection logic if necessary
    });

    socket.on('offer', data => {
        console.log(data.sdp);
        socket.to(data.offerReceiveID).emit('getOffer', {sdp: data.sdp, offerSendID: data.offerSendID, offerSendEmail: data.offerSendEmail});
    });

    socket.on('answer', data => {
        console.log(data.sdp);
        socket.to(data.answerReceiveID).emit('getAnswer', {sdp: data.sdp, answerSendID: data.answerSendID});
    });

    socket.on('candidate', data => {
        console.log(data.candidate);
        socket.to(data.candidateReceiveID).emit('getCandidate', {candidate: data.candidate, candidateSendID: data.candidateSendID});
    })

    socket.on('disconnect', () => {
        console.log(`[${socketToRoom[socket.id]}]: ${socket.id} exit`);
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(user => user.id !== socket.id);
            users[roomID] = room;
            if (room.length === 0) {
                delete users[roomID];
                return;
            }
        }
        socket.to(roomID).emit('user_exit', {id: socket.id});
        console.log(users);
    })
});

server.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
});