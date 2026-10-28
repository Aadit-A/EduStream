const express = require("express");
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");
const { validateCourse } = require("../middleware/validate");
const {
  authenticate,
  authorize,
  checkCourseOwnership,
} = require("../middleware/authMiddleware");

// GET    /courses     — get all courses (public catalog)
// GET    /courses/:id — get a single course with instructor details
// POST   /courses     — create a new course (instructor only)
// PATCH  /courses/:id — update a course (instructor + course owner only)
// DELETE /courses/:id — delete a course (instructor + course owner only)
router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.post("/", authenticate, authorize("instructor"), validateCourse, createCourse);
router.patch("/:id", authenticate, authorize("instructor"), checkCourseOwnership, updateCourse);
router.delete("/:id", authenticate, authorize("instructor"), checkCourseOwnership, deleteCourse);

module.exports = router;
