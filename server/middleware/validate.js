/**
 * Validation Middleware for User and Course payload validation
 * Returns consistent 400 Bad Request before database queries are executed
 */

const validateUser = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name is required and must be at least 2 characters long.");
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
    errors.push("A valid email address is required.");
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    errors.push("Password is required and must be at least 6 characters long.");
  }

  if (role && !["student", "instructor"].includes(role)) {
    errors.push("Role must be either 'student' or 'instructor'.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(" ") });
  }

  next();
};

const validateCourse = (req, res, next) => {
  const { title, category, instructorId, status } = req.body;
  const errors = [];

  if (!title || typeof title !== "string" || title.trim().length < 3) {
    errors.push("Course title is required and must be at least 3 characters long.");
  }

  if (!category || typeof category !== "string" || category.trim().length === 0) {
    errors.push("Course category is required.");
  }

  if (!instructorId || typeof instructorId !== "string") {
    errors.push("Instructor ID is required.");
  }

  if (status && !["draft", "published"].includes(status)) {
    errors.push("Status must be either 'draft' or 'published'.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(" ") });
  }

  next();
};

module.exports = {
  validateUser,
  validateCourse,
};