import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
  socket.on("room:join", (data) => {
    const { email, roomId } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);
    io.to(roomId).emit("user:joined", { email, id: socket.id });
    socket.join(roomId);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { offer, from: socket.id });
  });

  socket.on("call:accepted", ({ to, answer }) => {
    io.to(to).emit("call:accepted", { answer, from: socket.id });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("user:endcall", ({ to }) => {
    io.to(to).emit("user:endcall", { from: socket.id });
  });
});

httpServer.listen(3000, () => {
  console.log("Server running on port 3000");
});
