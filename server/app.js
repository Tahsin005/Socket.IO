import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookieParser from "cookie-parser";

const PORT = 3000;
const secretKeyJWT = "why-so-random-bruh";

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    }
});

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
}));

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/login", (req, res) => {
    const token = jwt.sign({ _id: "this-is-a-random-id" }, secretKeyJWT);

    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
        .json({
            message: "Login Success",
        });
});

io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res, (err) => {
        if (err) return next(err);

        const token = socket.request.cookies.token;
        if (!token) return next(new Error("Authentication Error"));

        const decoded = jwt.verify(token, secretKeyJWT);
        next();
    });
});


io.on("connection", (socket) => {
    console.log('User connected', socket.id);

    // socket.emit("welcome", `Welcome to the website ${socket.id}`);
    // socket.broadcast.emit("welcome", `${socket.id} joined the server`);

    socket.on("message", ({ message, room }) => {
        console.log(message, room);
        // io.emit("received-message", message);
        socket.to(room).emit("received-message", message);
    });

    socket.on("join-room", (room) => {
        socket.join(room);
        console.log(`User joined room ${room}`)
    })

    socket.on("disconnect", () => {
        console.log('User disconnected', socket.id);
    })
});

server.listen(PORT, () => {
    console.log(`Server is running on ${PORT}...`)
});