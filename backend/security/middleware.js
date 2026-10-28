import { verifyAccessToken } from "./auth.js";

export function authenticateToken(req, res, next) {
  const header = req.get("authorization");
  const [scheme, token] = header ? header.split(" ") : [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired access token." });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission for this action." });
    }
    return next();
  };
}

export function assertCourseOwnership(user, course) {
  if (!user || !course || user.role !== "instructor") {
    return false;
  }

  const instructorId = course.instructorId?.toString?.() ?? course.instructorId;
  return instructorId === user.sub;
}
