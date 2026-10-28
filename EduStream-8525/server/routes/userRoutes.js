const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById, createUser } = require("../controllers/userController");
const { validateUser } = require("../middleware/validate");
// GET  /users     — get all users
// POST /users     — register a new user (with request validation)
// GET  /users/:id — get a user by ID
router.get("/", getAllUsers);
router.post("/", validateUser, createUser);
router.get("/:id", getUserById);
module.exports = router;