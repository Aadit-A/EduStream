// server/server.js
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { PORT, CLIENT_ORIGIN } = require("./config/env");

// Middleware
const requestLogger = require("./middleware/requestLogger");

// Routes (Member 2's routes)
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");

const app = express();

// 1. Global Pre-processing Pipeline
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // Node.js stream-based file & console access logging

// 2. Mount API Routes
app.use("/users", userRoutes);
app.use("/courses", courseRoutes);
app.use("/activity-logs", activityLogRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "EduStream API is running", status: "active" });
});

// 3. Start Server after connecting to MongoDB
let server;
connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      console.log(`[SERVER] EduStream running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`[DATABASE ERROR] Failed to connect: ${err.message}`);
    process.exit(1);
  });

// 4. Graceful Shutdown for Node.js process events (SIGINT / SIGTERM)
const handleGracefulShutdown = (signal) => {
  console.log(`\n[SERVER] ${signal} received. Initiating graceful shutdown...`);
  if (server) {
    server.close(() => {
      console.log("[SERVER] HTTP server closed cleanly. Process exiting.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));

module.exports = app;