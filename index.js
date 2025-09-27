// server/index.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import clientRoutes from "./routes/clientRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------- MIDDLEWARE -------------------- */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

/* -------------------- API ROUTES -------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/client", clientRoutes);

app.get("/", (req, res) => {
  res.send("✅ HaideryDynamics Backend Running");
});

/* -------------------- SOCKET.IO -------------------- */
const server = createServer(app);

export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Track connected clients: { userId: socketId }
const clients = {};

// Socket authentication middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized: No token provided"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) return next(new Error("Invalid token"));

    socket.userId = decoded.id;
    next();
  } catch (err) {
    console.error("[Socket Auth] Error:", err.message);
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log(`📡 Client connected: ${socket.id}, UserID: ${socket.userId}`);

  // Map userId to socket.id
  clients[socket.userId] = socket.id;

  // Listen for custom events
  socket.on("notify-user", (data) => {
    const targetSocket = clients[data.userId];
    if (targetSocket) {
      io.to(targetSocket).emit("notification", data.message);
      console.log(`🔔 Sent notification to ${data.userId}:`, data.message);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    // Remove from clients mapping
    for (let userId in clients) {
      if (clients[userId] === socket.id) {
        delete clients[userId];
        break;
      }
    }
  });
});

/* -------------------- DATABASE + SERVER -------------------- */
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
