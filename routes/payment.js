// server/routes/payment.js
import express from "express";

const router = express.Router();

// Example test route
router.get("/", (req, res) => {
  res.json({ message: "Payment API working" });
});

// Later we can add real payment logic here:
// - Initiate payment
// - Verify transaction
// - Webhook handling

export default router;
