const express = require("express");
const router = express.Router();
const { getActivityLogs } = require("../controllers/activityLogController");

// GET /activity-logs             — get all logs (newest first)
// GET /activity-logs?userId=xxx  — filter logs by who performed the action
// GET /activity-logs?courseId=xxx — filter logs by course
router.get("/", getActivityLogs);

module.exports = router;
