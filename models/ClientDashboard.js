// server/models/ClientDashboard.js
import mongoose from "mongoose";

// ✅ Payments
const paymentSchema = new mongoose.Schema({
  amount: Number,
  dueDate: Date,
  status: {
    type: String,
    enum: ["pending", "paid", "overdue"],
    default: "pending",
  },
  note: String,
});

// ✅ Progress
const progressSchema = new mongoose.Schema({
  stage: String,
  percent: Number,
  updatedAt: { type: Date, default: Date.now },
  notes: String,
});

// ✅ Add-ons
const addonSchema = new mongoose.Schema({
  title: String,
  active: { type: Boolean, default: false },
  startedAt: Date,
  monthlyPrice: Number,
});

// ✅ Insights
const insightsSchema = new mongoose.Schema({
  visitors: { type: Number, default: 0 },
  leads: { type: Number, default: 0 },
  topPages: [{ title: String, views: Number }],
});

// ✅ Support Tickets
const supportSchema = new mongoose.Schema({
  subject: String,
  message: String,
  status: { type: String, enum: ["Open", "Closed"], default: "Open" },
  createdAt: { type: Date, default: Date.now },
});

// ✅ Documents
const documentSchema = new mongoose.Schema({
  name: String,
  url: String,
  uploadedAt: { type: Date, default: Date.now },
});

// ✅ Testimonials
const testimonialSchema = new mongoose.Schema({
  message: String,
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

// ✅ Client Dashboard Schema
const clientDashboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  companyName: String,
  payments: [paymentSchema],
  progress: [progressSchema],
  addons: [addonSchema],
  insights: insightsSchema,
  support: [supportSchema],
  documents: [documentSchema],
  testimonials: [testimonialSchema],
  notes: String,
});

export default mongoose.model("ClientDashboard", clientDashboardSchema);
