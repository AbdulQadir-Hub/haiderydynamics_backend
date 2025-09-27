// server/routes/clients.js
import express from "express";
import Project from "../models/Project.js";
import Payment from "../models/Payment.js";
import mongoose from "mongoose";

const router = express.Router();

// GET project for client
router.get("/:id/project", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid client id" });
    const project = await Project.findOne({ clientId: req.params.id });
    res.json(project || {});
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch project", error: err.message });
  }
});

// GET payments for client
router.get("/:id/payments", async (req, res) => {
  try {
    const payments = await Payment.find({ clientId: req.params.id }).sort({
      dueDate: 1,
    });
    res.json(payments);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch payments", error: err.message });
  }
});

export default router;
