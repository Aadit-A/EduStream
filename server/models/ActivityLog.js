const mongoose = require("mongoose");

// ActivityLog schema — records who created, edited, published, or deleted a course
const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ["COURSE_CREATED", "COURSE_UPDATED", "COURSE_PUBLISHED", "COURSE_DELETED"],
    },
    // Reference to the course (will be null if the course was deleted)
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    // Snapshot of the course title — preserved even after deletion
    courseTitle: {
      type: String,
      required: true,
    },
    // Reference to the user who performed the action
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Optional extra info like "Updated fields: title, category"
    details: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Convert _id to id for frontend compatibility
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
