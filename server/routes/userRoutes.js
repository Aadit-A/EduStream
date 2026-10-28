const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById, createUser } = require("../controllers/userController");

// GET  /users     — get all users
// POST /users     — register a new user
// GET  /users/:id — get a user by ID
router.get("/", getAllUsers);
router.post("/", createUser);
router.get("/:id", getUserById);

module.exports = router;
