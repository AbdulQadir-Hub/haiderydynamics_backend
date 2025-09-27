// server/routes/clientRoutes.js
import express from "express";
import auth from "../middleware/authMiddleware.js";
import multer from "multer";

import {
  // Dashboard
  getDashboard,
  createOrInitDashboard,
  // Payments
  updatePayments,
  // Testimonials
  getTestimonials,
  addTestimonial,
  // Insights
  getInsights,
  // Addons
  getAddons,
  updateAddons,
  // Progress
  updateProgress,
  // Support
  getSupport,
  addSupportTicket,
  updateSupportStatus,
  // Documents
  getDocuments,
  uploadDocument,
  deleteDocument,
} from "../controllers/clientControllers.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/* -------------------- DASHBOARD -------------------- */
router.get("/dashboard", auth, getDashboard);
router.post("/dashboard/init", auth, createOrInitDashboard);

/* -------------------- PAYMENTS -------------------- */
router.put("/payments", auth, updatePayments);

/* -------------------- TESTIMONIALS -------------------- */
router.get("/testimonials", auth, getTestimonials);
router.post("/testimonials", auth, addTestimonial);

/* -------------------- INSIGHTS -------------------- */
router.get("/insights", auth, getInsights);

/* -------------------- ADDONS -------------------- */
router.get("/addons", auth, getAddons);
router.put("/addons", auth, updateAddons);

/* -------------------- PROGRESS -------------------- */
router.put("/progress", auth, updateProgress);

/* -------------------- SUPPORT -------------------- */
router.get("/support", auth, getSupport);
router.post("/support", auth, addSupportTicket);
router.put("/support/:id", auth, updateSupportStatus);

/* -------------------- DOCUMENTS -------------------- */
router.get("/documents", auth, getDocuments);
router.post("/documents", auth, upload.single("file"), uploadDocument);
router.delete("/documents/:id", auth, deleteDocument);

export default router;
