// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

/**
 * Middleware to verify JWT token and attach user info to request
 * Usage: add `auth` to protected routes
 * Example: router.get("/me", auth, handler)
 */
export default function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // 🚫 No token provided
    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Verify & decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🚫 Invalid or missing payload
    if (!decoded || !decoded.id || !decoded.role) {
      return res.status(403).json({ message: "Invalid token payload" });
    }

    // ✅ Attach user info to request for later use
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email || null, // helpful for role-based checks
    };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
