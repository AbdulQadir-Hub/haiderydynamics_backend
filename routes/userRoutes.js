// src/routes/userRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  adminOnly,
  clientOnly,
  restrictTo,
} from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin-only route
router.get("/admin-dashboard", protect, adminOnly, (req, res) => {
  res.json({ message: "Welcome Admin!" });
});

// Client-only route
router.get("/client-dashboard", protect, clientOnly, (req, res) => {
  res.json({ message: "Welcome Client!" });
});

// Multi-role route
router.get(
  "/shared-dashboard",
  protect,
  restrictTo("admin", "client"),
  (req, res) => {
    res.json({ message: `Welcome ${req.user.role}! You have access.` });
  }
);

export default router;
