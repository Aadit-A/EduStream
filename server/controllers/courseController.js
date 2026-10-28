const Course = require("../models/Course");
const ActivityLog = require("../models/ActivityLog");

// Get all courses (populated with instructor name and email)
const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().populate("instructorId", "name email");
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

// Get a single course with full instructor details
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate("instructorId", "name email role");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    next(error);
  }
};

// Create a new course (saves as draft by default) and logs activity
const createCourse = async (req, res, next) => {
  try {
    const { instructorId, title, category, description, status } = req.body;

    const course = await Course.create({ instructorId, title, category, description, status });

    // Log the course creation in ActivityLog
    await ActivityLog.create({
      action: "COURSE_CREATED",
      courseId: course._id,
      courseTitle: course.title,
      performedBy: instructorId,
    });

    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
};

// Update a course (edit or publish) and logs the appropriate activity
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if status is transitioning to published
    const isPublishing = req.body.status === "published" && course.status !== "published";
    const updatedFields = Object.keys(req.body);

    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Record audit log
    if (isPublishing) {
      await ActivityLog.create({
        action: "COURSE_PUBLISHED",
        courseId: course._id,
        courseTitle: updatedCourse.title,
        performedBy: course.instructorId,
      });
    } else {
      await ActivityLog.create({
        action: "COURSE_UPDATED",
        courseId: course._id,
        courseTitle: updatedCourse.title,
        performedBy: course.instructorId,
        details: `Updated fields: ${updatedFields.join(", ")}`,
      });
    }

    res.json(updatedCourse);
  } catch (error) {
    next(error);
  }
};

// Delete a course and records deletion log with preserved courseTitle snapshot
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Log before deleting so we capture course details
    await ActivityLog.create({
      action: "COURSE_DELETED",
      courseId: course._id,
      courseTitle: course.title,
      performedBy: course.instructorId,
    });

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };
