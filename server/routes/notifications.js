// server/routes/notifications.js
import express from "express";

const router = express.Router();

// Example: fetch all notifications for a client
router.get("/", (req, res) => {
  res.json([
    { id: 1, message: "Your payment is due soon", type: "reminder" },
    { id: 2, message: "Website update completed", type: "update" },
  ]);
});

// Example: mark a notification as read
router.post("/read/:id", (req, res) => {
  const { id } = req.params;
  res.json({ message: `Notification ${id} marked as read` });
});

export default router;
