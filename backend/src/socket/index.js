// socket.js (or whatever your socket entry file is)
const jwt = require("jsonwebtoken");
const Filter = require("bad-words");
const filter = new Filter();
const Message = require("../models/Message");
const Channel = require("../models/Channel");
const Presence = require("../models/Presence");
const User = require("../models/User");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function (io) {
  // Maps to track user sockets and presence in memory for fast UI updates.
  const userSockets = new Map(); // userId => Set(socketIds)
  const memoryPresence = new Map(); // userId => { isOnline, lastActive, name, email, avatarUrl }

  // Helper: emit presence for a user (reads memoryPresence and user doc to be safe)
  async function emitPresence(userId) {
    // prefer memoryPresence data, but also fetch DB user for fallback
    const mem = memoryPresence.get(userId) || {};
    const userDoc = await User.findById(userId).lean().catch(() => null);

    const presencePayload = {
      isOnline: !!mem.isOnline,
      lastActive: mem.lastActive || null,
      name: mem.name || userDoc?.name || null,
      email: mem.email || userDoc?.email || null,
      avatarUrl: mem.avatarUrl || userDoc?.avatarUrl || null,
    };

    io.emit("presence:update", {
      user: { _id: userId },
      presence: presencePayload,
    });
  }

  io.on("connection", async (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    // --- AUTH ---
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.warn("Socket auth missing token — disconnecting:", socket.id);
      return socket.disconnect();
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.warn("Socket auth invalid token — disconnecting:", socket.id);
      return socket.disconnect();
    }

    const userId = payload.userId;
    socket.userId = userId;

    // Fetch user doc once (for name/email/avatar). If not found, still proceed.
    const userDoc = await User.findById(userId).lean().catch(() => null);
    const userName = userDoc?.name || null;
    const userEmail = userDoc?.email || null;
    const userAvatar = userDoc?.avatarUrl || null;

    // === TRACK MULTIPLE TABS / SOCKETS PER USER ===
    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId).add(socket.id);

    // If this is first socket for the user — mark online
    if (userSockets.get(userId).size === 1) {
      memoryPresence.set(userId, {
        isOnline: true,
        lastActive: new Date(),
        name: userName,
        email: userEmail,
        avatarUrl: userAvatar,
      });

      // Instant UI update (fast)
      emitPresence(userId);

      // async DB persist (non-blocking)
      Presence.updateOne(
        { userId },
        { userId, isOnline: true, lastActive: new Date(), name: userName, email: userEmail, avatarUrl: userAvatar },
        { upsert: true }
      ).exec();
    } else {
      // There are already sockets for this user. Update lastActive in memory.
      const prev = memoryPresence.get(userId) || {};
      memoryPresence.set(userId, {
        ...prev,
        lastActive: new Date(),
        name: prev.name || userName,
        email: prev.email || userEmail,
        avatarUrl: prev.avatarUrl || userAvatar,
      });
      // Optionally emit updated lastActive
      emitPresence(userId);
    }

    // --- JOIN CHANNEL ---
    socket.on("joinChannel", async ({ channelId }) => {
      if (!channelId) return;
      const channel = await Channel.findById(channelId).lean().catch(() => null);
      if (!channel) return;
      socket.join(channelId);
      console.log(`📌 User ${userId} joined channel ${channelId}`);
    });

    // --- LEAVE CHANNEL ---
    socket.on("leaveChannel", ({ channelId }) => {
      if (channelId) socket.leave(channelId);
    });

    // --- SEND MESSAGE (optimistic + persist) ---
    socket.on("sendMessage", async ({ channelId, text, fileUrl, fileType, clientSideId }) => {
      let filteredText = text;
      if (text) {
        try {
          filteredText = filter.clean(text);
        } catch (err) {
          console.error("Filter error:", err);
        }
      }

      const tempMsg = {
        _id: clientSideId || `temp-${Date.now()}`,
        clientSideId,
        channelId,
        text: filteredText,
        fileUrl,
        fileType,
        user: { 
          _id: userId,
          name: userName,
          email: userEmail,
          avatarUrl: userAvatar,
        },
        createdAt: new Date(),
        optimistic: true,
      };

      // Broadcast optimistic
      io.to(channelId).emit("newMessage", tempMsg);

      try {
        const msg = new Message({ channelId, userId, text: filteredText, fileUrl, fileType });
        await msg.save();

        const fullMsg = await Message.findById(msg._id)
          .populate("userId", "name email avatarUrl")
          .lean();

        const finalMsg = {
          ...fullMsg,
          user: fullMsg.userId,
          clientSideId,
        };

        io.to(channelId).emit("message:update", finalMsg);
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });
 
     // --- TYPING INDICATOR ---
     socket.on("typing", ({ channelId }) => {
       if (!channelId) return;
       // Broadcast to others in the same channel
       socket.to(channelId).emit("user:typing", {
         channelId,
         userId,
         userName,
       });
     });
 
     socket.on("stopTyping", ({ channelId }) => {
       if (!channelId) return;
       socket.to(channelId).emit("user:stopTyping", {
         channelId,
         userId,
       });
     });
 
     // --- HEARTBEAT (client pings frequently) ---
    socket.on("heartbeat", () => {
      const prev = memoryPresence.get(userId) || {};
      memoryPresence.set(userId, {
        ...prev,
        isOnline: true,
        lastActive: new Date(),
        name: prev.name || userName,
        email: prev.email || userEmail,
        avatarUrl: prev.avatarUrl || userAvatar,
      });

      // Persist lastActive async
      Presence.updateOne(
        { userId },
        { lastActive: new Date(), name: userName, email: userEmail, avatarUrl: userAvatar },
        { upsert: true }
      ).exec();

      // Optionally emit presence update (lightweight)
      // emitPresence(userId); // uncomment if you want live lastActive updates every heartbeat
    });

    // --- CLEAN DISCONNECT ---
    socket.on("disconnect", async () => {
      console.log("🔴 Socket disconnected:", socket.id);

      const set = userSockets.get(userId);
      if (!set) return;

      set.delete(socket.id);

      // if no sockets remain, mark user offline
      if (set.size === 0) {
        userSockets.delete(userId);

        // update memory presence
        const prev = memoryPresence.get(userId) || {};
        memoryPresence.set(userId, {
          ...prev,
          isOnline: false,
          lastActive: new Date(),
          name: prev.name || userName,
          email: prev.email || userEmail,
          avatarUrl: prev.avatarUrl || userAvatar,
        });

        // instant UI update
        emitPresence(userId);

        // DB update async
        Presence.updateOne(
          { userId },
          { userId, isOnline: false, lastActive: new Date(), name: userName, email: userEmail, avatarUrl: userAvatar },
          { upsert: true }
        ).exec();
      } else {
        // still some sockets left — update lastActive
        memoryPresence.set(userId, {
          ...memoryPresence.get(userId),
          lastActive: new Date(),
        });
        // optionally emit a light presence update
        // emitPresence(userId);
      }
    });
  });
};
