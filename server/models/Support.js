// server/models/Support.js
import mongoose from "mongoose";

const supportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subject: String,
  description: String,
  status: { type: String, enum: ["Open", "Closed"], default: "Open" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Support", supportSchema);
