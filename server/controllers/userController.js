const User = require("../models/User");
const appEvents = require("../events/appEvents");

// Get all users (passwords excluded)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Get a single user by ID (password excluded)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Create a new user (registration)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({ name, email, password, role });
    appEvents.emit("user:registered", user);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, createUser };
