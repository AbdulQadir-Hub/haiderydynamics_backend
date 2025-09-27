// server/routes/dashboard.js
import express from "express";
import auth from "../middleware/authMiddleware.js";
const router = express.Router();

// ✅ Only clients
router.use(auth);
router.use((req, res, next) => {
  if (req.userRole !== "client") {
    return res.status(403).json({ message: "Forbidden: Clients only" });
  }
  next();
});

router.get("/", async (req, res) => {
  res.json({ message: "Client dashboard API working" });
});

export default router;
