import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = new Set(["student", "instructor"]);
const PASSWORD_MIN_LENGTH = 8;

function getJwtSecret(secret = process.env.JWT_SECRET) {
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and contain at least 32 characters.");
  }
  return secret;
}

export function validateRegistrationInput({ name, email, password, role }) {
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!normalizedName || normalizedName.length > 100) {
    return { valid: false, message: "Name is required and must be 100 characters or fewer." };
  }
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return { valid: false, message: "A valid email address is required." };
  }
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, message: "Password must be at least 8 characters." };
  }
  if (!ROLES.has(role)) {
    return { valid: false, message: "Role must be student or instructor." };
  }

  return { valid: true, value: { name: normalizedName, email: normalizedEmail, password, role } };
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function sanitizeUser(user) {
  return {
    id: user.id ?? user._id?.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function createAccessToken(user, { secret = process.env.JWT_SECRET, expiresIn = "1h" } = {}) {
  return jwt.sign(
    { sub: sanitizeUser(user).id, role: user.role, email: user.email },
    getJwtSecret(secret),
    { expiresIn }
  );
}

export function verifyAccessToken(token, secret = process.env.JWT_SECRET) {
  if (!token || typeof token !== "string") {
    throw new Error("Access token is required.");
  }
  return jwt.verify(token, getJwtSecret(secret));
}

export { PASSWORD_MIN_LENGTH, ROLES };
