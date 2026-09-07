const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // ✅ attach full user info
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch (err) {
    return res.status(401).json({ status: "error", message: "Invalid token" });
  }
};

// ── Require admin role ───────────────────────────────────────────
// Use after verifyToken: router.get('/...', verifyToken, requireAdmin, handler)
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Forbidden. Admins only." });
  }

  next();
};

module.exports = { verifyToken, requireAdmin };
