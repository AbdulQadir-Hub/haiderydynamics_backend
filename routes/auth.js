// server/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ----------------- SIGNUP -----------------
 * Roles:
 * - Default: "user"
 * - @haiderydynamics.com email → "client"
 * - Only "abdulqadir@haiderydynamics.com" → "admin"
 */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role: requestedRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    let role = "user";

    if (email === "abdulqadir@haiderydynamics.com") role = "admin";
    else if (email.endsWith("@haiderydynamics.com")) role = "client";

    // Explicitly allow admin if requested and email matches
    if (
      requestedRole === "admin" &&
      email === "abdulqadir@haiderydynamics.com"
    ) {
      role = "admin";
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();

    res.status(201).json({
      message: "Account created successfully",
      role,
      user: { id: user._id, name: user.name, email: user.email, role },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

/**
 * ----------------- LOGIN -----------------
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

/**
 * ----------------- AUTH ME -----------------
 * Used by ProtectedRoute to validate user & role
 */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("Auth me error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: err.message });
  }
});

/**
 * ----------------- GET ALL CLIENTS (Admin Only) -----------------
 */
router.get("/clients", auth, async (req, res) => {
  try {
    if (
      req.user.role !== "admin" ||
      req.user.email !== "abdulqadir@haiderydynamics.com"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const clients = await User.find({ role: "client" }).select("-password");
    res.json({ clients });
  } catch (err) {
    console.error("Fetch clients error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch clients", error: err.message });
  }
});

export default router;
