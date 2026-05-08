import { Server } from "socket.io";

export const initChat = (httpServer, allowedOrigins = ["http://localhost:3000"]) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  console.log("[INFO] Socket.IO chat server initialized");

  let chatGroups = [];
  let users = {}; // ✅ CHANGED: { userId: { socketId, name } }

  const createUniqueId = () => Math.random().toString(36).substring(2, 10);

  // ✅ NEW: helper to build online users array with names
  const getOnlineUsers = () =>
    Object.entries(users).map(([id, data]) => ({ id, name: data.name }));

  io.on("connection", (socket) => {
    console.log(`[INFO] User connected: ${socket.id}`);

    // ✅ CHANGED: now accepts (userId, userName)
    socket.on("registerUser", (userId, userName) => {
      users[userId] = { socketId: socket.id, name: userName || "Unknown" };
      console.log(`[INFO] Registered ${userId} → ${socket.id} (${userName})`);
      io.emit("onlineUsers", getOnlineUsers()); // ✅ emits [{ id, name }]
    });

    socket.on("getAllGroups", () => {
      socket.emit("groupList", chatGroups);
    });

    socket.on("createNewGroup", (groupName) => {
      if (!groupName) return;
      const newGroup = { id: createUniqueId(), name: groupName, messages: [] };
      chatGroups.unshift(newGroup);
      socket.join(newGroup.name);
      io.emit("groupList", chatGroups);
    });

    socket.on("findGroup", (groupId) => {
      const group = chatGroups.find((g) => g.id === groupId);
      if (!group) return;
      socket.join(group.name);
      socket.emit("foundGroup", group.messages);
    });

    socket.on("newChatMessage", (data) => {
      const { messageText, groupId, sender, timeData } = data;
      const group = chatGroups.find((g) => g.id === groupId);
      if (!group) return;
      const newMessage = {
        id: createUniqueId(),
        text: messageText,
        sender,
        time: `${timeData.hr.toString().padStart(2, "0")}:${timeData.mins.toString().padStart(2, "0")}`,
      };
      group.messages.push(newMessage);
      io.in(group.name).emit("groupMessage", newMessage);
      io.emit("groupList", chatGroups);
    });

    socket.on("sendMessage", (data) => {
      const { toUserId, senderId, type, text, mediaUrl, time } = data;
      const receiverSocketId = users[toUserId]?.socketId; // ✅ CHANGED: .socketId

      const message = {
        id: createUniqueId(),
        type,
        text: type === "text" ? text : null,
        mediaUrl: type !== "text" ? mediaUrl : null,
        sender: senderId,
        time,
      };

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", message);
      }
      socket.emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
      console.log(`[INFO] User disconnected: ${socket.id}`);
      for (const userId in users) {
        if (users[userId].socketId === socket.id) { // ✅ CHANGED: .socketId
          delete users[userId];
          break;
        }
      }
      io.emit("onlineUsers", getOnlineUsers()); // ✅ CHANGED: emits objects
    });
  });
};