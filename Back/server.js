const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { instrument } = require("@socket.io/admin-ui");

let users = [];
let channels = [];
let messagesChannel = [];

const app = express();
const PORT = process.env.PORT || 4242;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    req.channels = channels;
    next();
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:4200", "https://admin.socket.io"],
        methods: ["GET", "POST", "PUT", "UPDATE"],
        credentials: true
    }
});

instrument(io, {
    auth: false,
    mode: "development",
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("pseudo", (pseudo) => {
        if (!users.some(user => user.pseudo === pseudo)) {
            users.push({ id: socket.id, pseudo: pseudo });
            console.log("User added:", { id: socket.id, pseudo: pseudo });
        } else {
            console.log("Welcome back:", pseudo);
        }
        io.emit("updateUserList", users);
    });

    socket.emit("connected", { message: "You are connected!" });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        users = users.filter(u => u.id !== socket.id);
        io.emit("updateUserList", users);
    });

    socket.on("message", (data) => {
        const { room, message, username, timestamp } = data;
        console.log(data)

        messagesChannel.push({ currentRoom: room, message: message, user: username, time: timestamp });
        console.log(messagesChannel)
        io.emit('getMessage', messagesChannel);
    });

    socket.on("get-previous-message", () => {
        io.emit('getMessage', messagesChannel);
    });

    // Salon
    socket.on("create-room", (data) => {
        const { channel, username, creator } = data;

        if (channels.some(c => c.name === channel)) {
            console.log('Channel déjà existant');
            socket.emit('error', 'Channel déjà existant');
        } else {
            channels.push({ name: channel, username: username, users: [username], creator: creator });
            console.log(`Room ${channel} was created by ${username}`);
            socket.join(channel);

            io.emit('channels', channels);
        }
    });

    socket.on("delete-room", (data) => {
        const { name } = data;
        channels = channels.filter(channel => channel.name !== name);
        messagesChannel = messagesChannel.filter(channel => channel.name !== name);
        console.log(`Room ${name} was deleted`);
        io.emit('channels', channels, messagesChannel);
    });

    socket.on("join-room", (data) => {
        const { channel, username } = data;
        const room = channels.find(c => c.name === channel);
        if (room) {
            socket.join(room.name);
            if (!room.users.includes(username)) {
                room.users.push(username);
            }
            console.log(`User ${username} joined room: ${room.name}`);
            socket.emit('room_joined', room.name);
            io.emit('channels', channels);
        } else {
            console.log('Room not found');
            socket.emit('error', 'Room not found');
        }
    });

    socket.on("get-room", () => {
        socket.emit('room_list', Array.from(channels));
    });

    socket.emit("updateUserList", users);

    socket.on("typing", (data) => {
        const { room, username } = data;
        io.emit('sendTyping', { username, room });
    });

    socket.on("stopTyping", (data) => {
        const { room, username } = data;
        io.emit('sendStopTyping', { username, room });
    });

    socket.on("userChannelConnected", (data) => {
        const { currentConnected } = data;
        io.emit('sendCurrentConnected', { currentConnected });
    });

    socket.on("updatePseudo", (data) => {
        const { name, currentPseudo } = data;
        const user = users.find(user => user.pseudo === currentPseudo);
        if (user) {
            user.pseudo = name;
        }
        io.emit("updateUserList", users);
        io.emit('refreshPseudo', { pseudo: name });
    });

    socket.on("updateChannelName", (data) => {
        const { name, currentRoom} = data;
        const channel = channels.find(channel => channel.name === currentRoom);

        if (channel) {
            channel.name = name;
            io.emit("list_channel", { updateChannel: { id: channel.id, name: channel.name }, newRoom: channel.name });
            io.emit('room_list', Array.from(channels));

        } else {
            console.error("Channel not found");
        }
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = channels;
