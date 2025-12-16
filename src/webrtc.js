// webrtcSocket.js
import { Server } from "socket.io";

export const initWebRTC = (server, allowedOrigins) => {
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
    },
  });

  let onlineUsers = [];
  let activeCalls = new Map();

  io.on("connection", (socket) => {
    console.log(`[INFO] New connection: ${socket.id}`);

    socket.emit("me", socket.id);

    socket.on("join", (user) => {
      if (!user?.id) return;
      socket.join(user.id);

      const existingUser = onlineUsers.find(u => u.userId === user.id);
      if (existingUser) existingUser.socketId = socket.id;
      else onlineUsers.push({ userId: user.id, name: user.name, socketId: socket.id });

      io.emit("online-users", onlineUsers);
    });

    socket.on("callToUser", (data) => {
      const callee = onlineUsers.find(u => u.userId === data.callToUserId);
      if (!callee) {
        socket.emit("userUnavailable");
        return;
      }
      if (activeCalls.has(data.callToUserId)) {
        socket.emit("userBusy");
        return;
      }
      io.to(callee.socketId).emit("callToUser", data);
    });

    socket.on("answeredCall", (data) => {
      io.to(data.to).emit("callAccepted", data);
      activeCalls.set(data.from, { with: data.to });
      activeCalls.set(data.to, { with: data.from });
    });

    socket.on("ice-candidate", (data) => {
      io.to(data.to).emit("ice-candidate", data);
    });

    socket.on("call-ended", (data) => {
      io.to(data.to).emit("callEnded", data);
      activeCalls.delete(data.from);
      activeCalls.delete(data.to);
    });

    socket.on("disconnect", () => {
      const user = onlineUsers.find(u => u.socketId === socket.id);
      if (user) {
        activeCalls.delete(user.userId);
        onlineUsers = onlineUsers.filter(u => u.socketId !== socket.id);
      }
      io.emit("online-users", onlineUsers);
    });
  });

  console.log("[SUCCESS] WebRTC Socket Initialized");
};
