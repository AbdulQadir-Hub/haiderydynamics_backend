// server/models/Project.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, default: "Website Project" },
    status: {
      type: String,
      enum: ["design", "development", "testing", "deployment", "completed"],
      default: "design",
    },
    progress: { type: Number, default: 0 }, // 0 - 100
    nextPaymentDue: { type: Date },
    lastUpdated: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
