const User = require("../models/User");
const appEvents = require("../events/appEvents");
const { generateToken, sanitizeUser } = require("../utils/jwt");

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const ROLES = ["student", "instructor"];

/**
 * Register a new user
 * POST /auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ message: "Name is required and must be at least 2 characters long." });
    }

    if (!email || typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
      return res.status(400).json({ message: "A valid email address is required." });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password is required and must be at least 6 characters long." });
    }

    const assignedRole = role || "student";
    if (!ROLES.includes(assignedRole)) {
      return res.status(400).json({ message: "Role must be either student or instructor." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for existing account
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    // Create user - pre('save') hook handles password hashing automatically
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: assignedRole,
    });

    appEvents.emit("user:registered", user);

    const safeUser = sanitizeUser(user);
    const token = generateToken(user);

    return res.status(201).json({
      user: safeUser,
      token,
      // Provide id/name at top-level for direct JSON consumer compatibility
      id: safeUser.id,
      name: safeUser.name,
      email: safeUser.email,
      role: safeUser.role,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    return next(error);
  }
};

/**
 * Authenticate user and return access token
 * POST /auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const safeUser = sanitizeUser(user);
    const token = generateToken(user);

    return res.json({
      user: safeUser,
      token,
      // Provide id/name at top-level for direct JSON consumer compatibility
      id: safeUser.id,
      name: safeUser.name,
      email: safeUser.email,
      role: safeUser.role,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
