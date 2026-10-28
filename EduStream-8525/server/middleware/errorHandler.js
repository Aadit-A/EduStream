// Centralized error handler — catches all errors from controllers
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error (missing required fields, invalid enum, etc.)
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // Mongoose bad ObjectId format
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  // MongoDB duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `Duplicate value for ${field}` });
  }

  // Default server error
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
