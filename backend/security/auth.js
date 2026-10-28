import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = new Set(["student", "instructor"]);
const PASSWORD_MIN_LENGTH = 8;

function jwtSecret(secret = process.env.JWT_SECRET) {
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long.");
  }
  return secret;
}

export function validateRegistrationInput(input = {}) {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const { password, role } = input;

  if (!name || name.length > 100) {
    return { valid: false, message: "Name is required and must be 100 characters or fewer." };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { valid: false, message: "A valid email address is required." };
  }
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.` };
  }
  if (!ROLES.has(role)) {
    return { valid: false, message: "Role must be student or instructor." };
  }

  return { valid: true, value: { name, email, password, role } };
}

export const hashPassword = (password) => bcrypt.hash(password, 12);
export const verifyPassword = (password, passwordHash) => bcrypt.compare(password, passwordHash);

export function sanitizeUser(user) {
  return {
    id: user.id ?? user._id?.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function createAccessToken(user, { secret = process.env.JWT_SECRET, expiresIn = "1h" } = {}) {
  const safeUser = sanitizeUser(user);
  return jwt.sign(
    { sub: safeUser.id, email: safeUser.email, role: safeUser.role },
    jwtSecret(secret),
    { expiresIn }
  );
}

export function verifyAccessToken(token, secret = process.env.JWT_SECRET) {
  if (!token || typeof token !== "string") {
    throw new Error("Access token is required.");
  }
  return jwt.verify(token, jwtSecret(secret));
}

export { PASSWORD_MIN_LENGTH, ROLES };
