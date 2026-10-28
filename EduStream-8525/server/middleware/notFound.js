
/**
 * 404 Route Not Found Middleware
 * Intercepts requests that do not match any registered endpoint
 */

const notFound = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.method} ${req.originalUrl}`);
  error.statusCode = 404; // <-- This lets Member 2's errorHandler return 404!
  next(error);
};

module.exports = notFound;