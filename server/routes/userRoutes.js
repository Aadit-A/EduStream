const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById } = require("../controllers/userController");
const { register, login } = require("../controllers/authController");
const { validateUser } = require("../middleware/validate");

// GET  /users       — get all users (sanitized, passwords omitted)
// POST /users       — register a new user with token issuance (backward compatibility)
// POST /users/login — login endpoint alias
// GET  /users/:id   — get user by ID
router.get("/", getAllUsers);
router.post("/", validateUser, register);
router.post("/login", login);
router.get("/:id", getUserById);

module.exports = router;
