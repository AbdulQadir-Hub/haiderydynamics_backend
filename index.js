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

dotenv.config(); // Load .env before everything

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------- ALLOWED ORIGINS -------------------- */
const allowedOrigins = [
  "http://localhost:3000",
  "https://haiderydynamics.com",
  "https://www.haiderydynamics.com",
  "https://haiderydynamics.netlify.app",
];

/* -------------------- CORS CONFIG -------------------- */
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight (OPTIONS) manually to ensure compatibility on Render
app.options("*", cors());

/* -------------------- BODY PARSER -------------------- */
app.use(express.json());

/* -------------------- ROUTES -------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/client", clientRoutes);

app.get("/", (req, res) => {
  res.send("✅ HaideryDynamics Backend Running Successfully!");
});

/* -------------------- SOCKET.IO CONFIG -------------------- */
const server = createServer(app);

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

const clients = {};

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized: No token provided"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return next(new Error("Invalid token"));

    socket.userId = decoded.id;
    next();
  } catch (err) {
    console.error("[Socket Auth] Error:", err.message);
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log(`📡 Client connected: ${socket.id}, UserID: ${socket.userId}`);

  clients[socket.userId] = socket.id;

  socket.on("notify-user", (data) => {
    const targetSocket = clients[data.userId];
    if (targetSocket) {
      io.to(targetSocket).emit("notification", data.message);
      console.log(`🔔 Sent notification to ${data.userId}:`, data.message);
    }
  });

  socket.on("disconnect", () => {
    for (let userId in clients) {
      if (clients[userId] === socket.id) delete clients[userId];
    }
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

/* -------------------- DATABASE CONNECTION -------------------- */
const MONGO_URI =
  process.env.NODE_ENV === "production"
    ? process.env.MONGO_URI_PROD
    : process.env.MONGO_URI_LOCAL;

console.log("Connecting to MongoDB with URI:", MONGO_URI);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
