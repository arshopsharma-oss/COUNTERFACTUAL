const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const rooms = new Map();

io.on("connection", (socket) => {
  socket.on("create-room", ({ name }, callback) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms.set(code, { host: socket.id, participants: [] });
    joinRoom(socket, code, name, callback);
  });

  socket.on("join-room", ({ code, name }, callback) => {
    joinRoom(socket, code.toUpperCase(), name, callback);
  });

  socket.on("send-message", ({ code, name, text }) => {
    if (!rooms.has(code) || !text?.trim()) return;
    io.to(code).emit("new-message", {
      name, text: text.trim(), time: new Date().toISOString()
    });
  });

  socket.on("disconnect", () => {
    for (const [code, room] of rooms) {
      room.participants = room.participants.filter(p => p.id !== socket.id);
      if (room.participants.length === 0) rooms.delete(code);
      else io.to(code).emit("participants", room.participants);
    }
  });
});

function joinRoom(socket, code, name, callback) {
  const room = rooms.get(code);
  if (!room) return callback?.({ error: "Room not found" });
  if (room.participants.length >= 4)
    return callback?.({ error: "Room is full" });

  const participant = {
    id: socket.id,
    name: String(name || "Guest").slice(0, 20)
  };

  room.participants.push(participant);
  socket.join(code);

  io.to(code).emit("participants", room.participants);
  callback?.({ success: true, code, participants: room.participants });
}

app.get("/", (_, res) => res.send("COUNTERFACTUAL WAR ROOM SERVER ONLINE"));

server.listen(3001, "0.0.0.0", () => {
  console.log("WAR ROOM SERVER ONLINE — PORT 3001");
});
