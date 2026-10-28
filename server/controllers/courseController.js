const Course = require("../models/Course");
const ActivityLog = require("../models/ActivityLog");
const appEvents = require("../events/appEvents")

// Get all courses
// Note: We return instructorId as an ID string (or preserve both id & details)
// so the frontend filter `c.instructorId === currentUser.id` works seamlessly!
const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

// Get a single course with full instructor details (uses populate)
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
    const effectiveInstructorId = req.user ? (req.user.sub || req.user.id) : instructorId;
    
    const course = await Course.create({
      instructorId: effectiveInstructorId,
      title,
      category,
      description,
      status: status || "draft",
    });
    
    // Log the course creation in ActivityLog
    await ActivityLog.create({
      action: "COURSE_CREATED",
      courseId: course._id,
      courseTitle: course.title,
      performedBy: effectiveInstructorId,
    });
    
    appEvents.emit("course:created", course);
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
      appEvents.emit("course:published", updatedCourse);
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
    appEvents.emit("course:deleted", { id: req.params.id, title: course.title });

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };
