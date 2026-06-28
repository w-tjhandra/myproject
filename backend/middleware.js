const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "changeme-use-strong-secret-in-production";

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token invalid or expired" });
  }
}

module.exports = { authMiddleware, SECRET };
