const EventEmitter = require("events");
/**
 * Domain Event Emitter for EduStream LMS
 * Demonstrates Node.js EventEmitter and Observer pattern
 * Decouples core database operations from side-effects like logging or notifications
 */
class AppEventEmitter extends EventEmitter {}
const appEvents = new AppEventEmitter();
// Event Listener: Course Creation
appEvents.on("course:created", (course) => {
  console.log(`[EVENT] Course Created: "${course.title}" (ID: ${course._id || course.id})`);
});
// Event Listener: Course Publication
appEvents.on("course:published", (course) => {
  console.log(`[EVENT] Course Published: "${course.title}" is now visible to students.`);
});
// Event Listener: Course Deletion
appEvents.on("course:deleted", (courseData) => {
  console.log(`[EVENT] Course Deleted: "${courseData.title}" (ID: ${courseData.id})`);
});
// Event Listener: User Registration
appEvents.on("user:registered", (user) => {
  console.log(`[EVENT] User Registered: ${user.name} <${user.email}> as [${user.role}]`);
});
module.exports = appEvents;