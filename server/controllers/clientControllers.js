import ClientDashboard from "../models/ClientDashboard.js";
import User from "../models/User.js";
import Testimonial from "../models/Testimonial.js";
import Support from "../models/Support.js";
import Document from "../models/Document.js";

/* -------------------- DASHBOARD -------------------- */
export const getDashboard = async (req, res) => {
  try {
    const userId = req.userId;
    const dash = await ClientDashboard.findOne({ userId });
    if (!dash)
      return res
        .status(404)
        .json({ success: false, message: "Dashboard not found" });

    return res.json({ success: true, dashboard: dash });
  } catch (err) {
    console.error("❌ getDashboard error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createOrInitDashboard = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    let dash = await ClientDashboard.findOne({ userId });
    if (!dash) {
      dash = new ClientDashboard({
        userId,
        companyName: `${user.name} (client)`,
        payments: [],
        progress: [],
        addons: [],
        insights: { visitors: 0, leads: 0, topPages: [] },
      });
      await dash.save();
    }

    return res.json({ success: true, dashboard: dash });
  } catch (err) {
    console.error("❌ createOrInitDashboard error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------- PAYMENTS -------------------- */
export const updatePayments = async (req, res) => {
  try {
    const userId = req.userId;
    const { payments } = req.body;

    const dash = await ClientDashboard.findOneAndUpdate(
      { userId },
      { payments },
      { new: true }
    );

    // Emit real-time notification to the client
    const io = req.app.get("io");
    if (io) io.to(userId).emit("notification", "Payments updated");

    return res.json({ success: true, payments: dash?.payments || [] });
  } catch (err) {
    console.error("❌ updatePayments error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------- TESTIMONIALS -------------------- */
export const getTestimonials = async (req, res) => {
  try {
    const userId = req.userId;
    const testimonials = await Testimonial.find({ userId }).sort({
      createdAt: -1,
    });
    return res.json({ success: true, testimonials });
  } catch (err) {
    console.error("❌ getTestimonials error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch testimonials" });
  }
};

export const addTestimonial = async (req, res) => {
  try {
    const userId = req.userId;
    const { message, rating } = req.body;
    if (!message || !rating)
      return res
        .status(400)
        .json({ success: false, message: "Message & rating required" });

    const testimonial = new Testimonial({ userId, message, rating });
    await testimonial.save();

    const io = req.app.get("io");
    if (io) io.to(userId).emit("notification", "New testimonial added");

    return res
      .status(201)
      .json({ success: true, message: "Testimonial submitted", testimonial });
  } catch (err) {
    console.error("❌ addTestimonial error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to submit testimonial" });
  }
};

/* -------------------- INSIGHTS -------------------- */
export const getInsights = async (req, res) => {
  try {
    const userId = req.userId;
    const dash = await ClientDashboard.findOne({ userId });
    if (!dash)
      return res
        .status(404)
        .json({ success: false, message: "Dashboard not found" });

    const totalPayments = dash.payments.reduce(
      (a, p) => a + (p.amount || 0),
      0
    );
    const paidPayments = dash.payments.filter(
      (p) => p.status === "paid"
    ).length;
    const progressPercent = dash.progress.length
      ? Math.round(
          dash.progress.reduce((a, p) => a + p.percent, 0) /
            dash.progress.length
        )
      : 0;

    return res.json({
      success: true,
      insights: {
        totalPayments,
        paidPayments,
        progressPercent,
        ...dash.insights,
      },
    });
  } catch (err) {
    console.error("❌ getInsights error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch insights" });
  }
};

/* -------------------- ADDONS -------------------- */
export const getAddons = async (req, res) => {
  try {
    const userId = req.userId;
    const dash = await ClientDashboard.findOne({ userId });
    return res.json({ success: true, addons: dash?.addons || [] });
  } catch (err) {
    console.error("❌ getAddons error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch add-ons" });
  }
};

export const updateAddons = async (req, res) => {
  try {
    const userId = req.userId;
    const { addons } = req.body;
    const dash = await ClientDashboard.findOneAndUpdate(
      { userId },
      { addons },
      { new: true }
    );

    const io = req.app.get("io");
    if (io) io.to(userId).emit("notification", "Add-ons updated");

    return res.json({ success: true, addons: dash?.addons || [] });
  } catch (err) {
    console.error("❌ updateAddons error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update add-ons" });
  }
};

/* -------------------- PROGRESS -------------------- */
export const updateProgress = async (req, res) => {
  try {
    const userId = req.userId;
    const { progress } = req.body;
    const dash = await ClientDashboard.findOneAndUpdate(
      { userId },
      { progress },
      { new: true }
    );

    const io = req.app.get("io");
    if (io) io.to(userId).emit("notification", "Progress updated");

    return res.json({ success: true, progress: dash?.progress || [] });
  } catch (err) {
    console.error("❌ updateProgress error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update progress" });
  }
};

/* -------------------- SUPPORT -------------------- */
export const getSupport = async (req, res) => {
  try {
    const userId = req.userId;
    const tickets = await Support.find({ userId }).sort({ createdAt: -1 });
    return res.json({ success: true, tickets });
  } catch (err) {
    console.error("❌ getSupport error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch support tickets" });
  }
};

export const addSupportTicket = async (req, res) => {
  try {
    const userId = req.userId;
    const { subject, description } = req.body;
    if (!subject || !description)
      return res
        .status(400)
        .json({ success: false, message: "Subject & description required" });

    const ticket = new Support({
      userId,
      subject,
      description,
      status: "Open",
    });
    await ticket.save();

    const io = req.app.get("io");
    if (io) io.to(userId).emit("notification", "New support ticket created");

    return res
      .status(201)
      .json({ success: true, message: "Support ticket created", ticket });
  } catch (err) {
    console.error("❌ addSupportTicket error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create support ticket" });
  }
};

export const updateSupportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ticket = await Support.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    const io = req.app.get("io");
    if (io && ticket)
      io.to(ticket.userId).emit(
        "notification",
        `Support ticket status updated to ${status}`
      );

    return res.json({ success: true, ticket });
  } catch (err) {
    console.error("❌ updateSupportStatus error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update support ticket" });
  }
};

/* -------------------- DOCUMENTS -------------------- */
export const getDocuments = async (req, res) => {
  try {
    const userId = req.userId;
    const docs = await Document.find({ userId });
    return res.json({ success: true, documents: docs });
  } catch (err) {
    console.error("❌ getDocuments error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch documents" });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    const userId = req.userId;
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });

    const doc = new Document({
      userId,
      name: req.file.originalname,
      path: req.file.path,
    });
    await doc.save();

    const io = req.app.get("io");
    if (io) io.to(userId).emit("notification", "New document uploaded");

    return res
      .status(201)
      .json({ success: true, message: "Document uploaded", document: doc });
  } catch (err) {
    console.error("❌ uploadDocument error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to upload document" });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findByIdAndDelete(id);

    const io = req.app.get("io");
    if (io && doc) io.to(doc.userId).emit("notification", "Document deleted");

    return res.json({ success: true, message: "Document deleted" });
  } catch (err) {
    console.error("❌ deleteDocument error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete document" });
  }
};
