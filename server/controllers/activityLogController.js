const ActivityLog = require("../models/ActivityLog");

// Get all activity logs (supports filtering by userId or courseId)
const getActivityLogs = async (req, res, next) => {
  try {
    const filter = {};

    // Filter by user if ?userId=xxx is provided
    if (req.query.userId) {
      filter.performedBy = req.query.userId;
    }

    // Filter by course if ?courseId=xxx is provided
    if (req.query.courseId) {
      filter.courseId = req.query.courseId;
    }

    const logs = await ActivityLog.find(filter)
      .populate("performedBy", "name email role")
      .populate("courseId", "title category status")
      .sort({ timestamp: -1 }); // newest first

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivityLogs };
