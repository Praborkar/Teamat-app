require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const channelsRoutes = require('./routes/channels');
const messagesRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');

const socketHandler = require('./socket');

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

// Connect DB
connectDB(MONGO_URI);

const app = express();
const server = http.createServer(app);

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://deeref-chatapp.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// === STATIC FILES ===
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// === SOCKET.IO SETUP (FIXED) ===
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  transports: ["polling", "websocket"],  // IMPORTANT
  pingTimeout: 60000,                    // fixes delay
  pingInterval: 25000,
  upgrade: true,
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// === ROUTES ===
app.use('/auth', authRoutes);
app.use('/channels', channelsRoutes);
app.use('/messages', messagesRoutes);
app.use('/users', userRoutes);

app.get("/", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// === SOCKET HANDLER ===
socketHandler(io);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
