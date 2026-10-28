const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/env");

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long.");
}

/**
 * Returns a sanitized user object without sensitive data
 */
function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id ? user.id.toString() : user._id ? user._id.toString() : undefined,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/**
 * Signs an access JWT token for an authenticated user
 */
function generateToken(user, options = {}) {
  const safeUser = sanitizeUser(user);
  const secret = options.secret || JWT_SECRET;
  const expiresIn = options.expiresIn || JWT_EXPIRES_IN || "7d";

  return jwt.sign(
    {
      sub: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
    },
    secret,
    { expiresIn }
  );
}

/**
 * Verifies a JWT token and returns decoded claims
 */
function verifyToken(token, secret = JWT_SECRET) {
  if (!token || typeof token !== "string") {
    throw new Error("Access token is required.");
  }
  return jwt.verify(token, secret);
}

module.exports = {
  sanitizeUser,
  generateToken,
  verifyToken,
};
