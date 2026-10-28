const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

// POST /auth/register — register new user and issue JWT
router.post("/register", register);

// POST /auth/login — authenticate credentials and issue JWT
router.post("/login", login);

// GET /auth/me — get authenticated user profile
router.get("/me", authenticate, getMe);

module.exports = router;
