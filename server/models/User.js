// server/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // ✅ Role: user (visitor), client, or admin
    role: {
      type: String,
      enum: ["user", "client", "admin"],
      default: "user",
    },

    // ✅ Client Info
    companyName: { type: String }, // e.g., Client’s Business Name
    websitePackage: { type: String }, // e.g., Package 1, 2, 3
    progress: { type: Number, default: 0 }, // Website completion % (0–100)

    // ✅ Payment tracking
    advancePaid: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 0 },
    addons: [
      {
        name: String,
        price: Number,
        paid: { type: Boolean, default: false },
      },
    ],

    // ✅ Reminders
    paymentDueDate: { type: Date },
    lastReminderSent: { type: Date },

    // ✅ Website Analytics
    websiteAnalytics: {
      visitors: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now },
    },

    // ✅ NEW: Track if client is online (Socket.IO)
    isOnline: { type: Boolean, default: false },

    // ✅ NEW: Keep track of the client’s current socketId for live updates
    socketId: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
