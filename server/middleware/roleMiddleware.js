// src/middleware/roleMiddleware.js
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: No user found" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  next();
};

export const clientOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: No user found" });
  }
  if (req.user.role !== "client") {
    return res.status(403).json({ message: "Forbidden: Clients only" });
  }
  next();
};

// Generic role middleware
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `Forbidden: Requires one of roles: ${roles}` });
    }
    next();
  };
};
