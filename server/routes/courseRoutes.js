const express = require("express");
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

// GET    /courses     — get all courses
// POST   /courses     — create a new course
// GET    /courses/:id — get a single course with instructor details
// PATCH  /courses/:id — update a course (edit or publish)
// DELETE /courses/:id — delete a course
router.get("/", getAllCourses);
router.post("/", createCourse);
router.get("/:id", getCourseById);
router.patch("/:id", updateCourse);
router.delete("/:id", deleteCourse);

module.exports = router;
