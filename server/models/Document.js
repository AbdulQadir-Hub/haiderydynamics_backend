// server/models/Document.js
import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  path: String,
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Document", documentSchema);
