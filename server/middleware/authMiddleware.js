const { verifyToken } = require("../utils/jwt");
const Course = require("../models/Course");

/**
 * Validates whether a user owns a given course
 */
function assertCourseOwnership(user, course) {
  if (!user || user.role !== "instructor" || !course) {
    return false;
  }
  const ownerId = course.instructorId?.toString ? course.instructorId.toString() : course.instructorId;
  const userId = user.sub || user.id;
  return ownerId === userId;
}

/**
 * Middleware: Verifies Bearer JWT token from Authorization header
 */
function authenticate(req, res, next) {
  const authHeader = req.get("authorization") || req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired access token." });
  }
}

/**
 * Middleware factory: Restricts endpoint access to specific roles
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission for this action." });
    }
    return next();
  };
}

/**
 * Middleware: Verifies that the authenticated user is an instructor who owns the target course
 */
async function checkCourseOwnership(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!assertCourseOwnership(req.user, course)) {
      return res.status(403).json({ message: "You do not have permission to modify this course." });
    }

    req.course = course;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  authenticate,
  authenticateToken: authenticate,
  authorize,
  requireRole: authorize,
  checkCourseOwnership,
  assertCourseOwnership,
};
