// server/middleware/requestLogger.js
const fs = require("fs");
const path = require("path");

// Resolve logs directory path safely
const logDir = path.resolve(__dirname, "../logs");

// Ensure logs directory exists (fs synchronous directory check & creation)
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Node.js Stream: Create an append-only write stream to access.log
const accessLogStream = fs.createWriteStream(path.join(logDir, "access.log"), {
  flags: "a",
  encoding: "utf-8",
});

/**
 * Request logger middleware demonstrating Node.js Streams, FileSystem & Event handling
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Listen for the response finish event
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${req.method} ${req.originalUrl} HTTP/${req.httpVersion} ${res.statusCode} - ${duration}ms\n`;

    // Terminal output for active development
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);

    // Stream write to persistent disk file without blocking the event loop
    accessLogStream.write(logLine);
  });

  next();
};

module.exports = requestLogger;