// server/routes/admin.js
import express from "express";
import Project from "../models/Project.js";
import Payment from "../models/Payment.js";
import mongoose from "mongoose";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Protect all admin routes
router.use(auth);

// ✅ Only allow the real admin (abdulqadir@haiderydynamics.com)
router.use((req, res, next) => {
  if (
    req.userRole !== "admin" ||
    req.userEmail !== "abdulqadir@haiderydynamics.com"
  ) {
    return res.status(403).json({ message: "Forbidden: Admin access only" });
  }
  next();
});

// ----------------- UPSERT PROJECT FOR CLIENT -----------------
router.put("/clients/:id/project", async (req, res) => {
  try {
    const clientId = req.params.id;
    if (!mongoose.isValidObjectId(clientId))
      return res.status(400).json({ message: "Invalid client id" });

    const payload = req.body || {};
    payload.lastUpdated = new Date();

    const project = await Project.findOneAndUpdate({ clientId }, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    // Emit socket event if socket.io is set
    const io = req.app.get("io");
    if (io) io.to(clientId.toString()).emit("projectUpdated", project);

    res.json(project);
  } catch (err) {
    console.error("admin update project error:", err);
    res.status(500).json({ message: "Failed to update", error: err.message });
  }
});

// ----------------- CREATE PAYMENT -----------------
router.post("/clients/:id/payments", async (req, res) => {
  try {
    const clientId = req.params.id;
    const { amount, dueDate, currency = "INR", notes } = req.body;

    const payment = new Payment({ clientId, amount, dueDate, currency, notes });
    await payment.save();

    const io = req.app.get("io");
    if (io) io.to(clientId.toString()).emit("paymentCreated", payment);

    res.status(201).json(payment);
  } catch (err) {
    console.error("admin create payment error:", err);
    res
      .status(500)
      .json({ message: "Failed to create payment", error: err.message });
  }
});

// ----------------- UPDATE PAYMENT -----------------
router.put("/clients/:id/payments/:paymentId", async (req, res) => {
  try {
    const { id: clientId, paymentId } = req.params;
    if (!mongoose.isValidObjectId(paymentId))
      return res.status(400).json({ message: "Invalid payment id" });

    const payment = await Payment.findByIdAndUpdate(paymentId, req.body, {
      new: true,
    });

    const io = req.app.get("io");
    if (io) io.to(clientId.toString()).emit("paymentUpdated", payment);

    res.json(payment);
  } catch (err) {
    console.error("admin update payment error:", err);
    res
      .status(500)
      .json({ message: "Failed to update payment", error: err.message });
  }
});

export default router;
