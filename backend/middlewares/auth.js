const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  // Accept header Authorization ou cookie
  const token =
    req.headers["authorization"]?.split(" ")[1] ||
    req.cookies.accessToken;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token invalide ou expiré" });
  }
}

module.exports = authenticate;