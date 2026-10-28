const { MONGO_URI } = require("./config/env");
const mongoose = require("mongoose");
const User = require("./models/User");
const Course = require("./models/Course");
const ActivityLog = require("./models/ActivityLog");

// Seed sample users and courses into MongoDB
const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    // Clear existing data
    console.log("Clearing existing users, courses, and logs...");
    await User.deleteMany({});
    await Course.deleteMany({});
    await ActivityLog.deleteMany({});

    // 1. Create demo users (1 instructor, 1 student)
    console.log("Seeding users...");
    const instructor = await User.create({
      name: "Prof. Alan Turing",
      email: "you@email.com",
      password: "12344", // Matching default frontend test credentials
      role: "instructor",
    });

    const student = await User.create({
      name: "Ada Lovelace",
      email: "aryankanas2005@gmail.com",
      password: "1234",
      role: "student",
    });

    console.log(`Created Instructor: ${instructor.name} (${instructor.email})`);
    console.log(`Created Student: ${student.name} (${student.email})`);

    // 2. Create demo courses linked to instructor
    console.log("Seeding courses...");
    const course1 = await Course.create({
      instructorId: instructor._id,
      title: "Data Structures & Algorithms",
      category: "Computer Science",
      description: "Master essential algorithms, arrays, trees, and dynamic programming.",
      status: "published",
    });

    const course2 = await Course.create({
      instructorId: instructor._id,
      title: "Introduction to Modern Physics",
      category: "Physics",
      description: "Explore relativity, quantum mechanics, and atomic structures.",
      status: "published",
    });

    const course3 = await Course.create({
      instructorId: instructor._id,
      title: "Full-Stack Web Development",
      category: "Computer Science",
      description: "Building responsive full stack applications with React and Node.js.",
      status: "draft",
    });

    console.log(`Created 3 demo courses.`);

    // 3. Create initial activity logs
    console.log("Seeding initial audit logs...");
    await ActivityLog.create([
      {
        action: "COURSE_CREATED",
        courseId: course1._id,
        courseTitle: course1.title,
        performedBy: instructor._id,
      },
      {
        action: "COURSE_PUBLISHED",
        courseId: course1._id,
        courseTitle: course1.title,
        performedBy: instructor._id,
      },
      {
        action: "COURSE_CREATED",
        courseId: course2._id,
        courseTitle: course2.title,
        performedBy: instructor._id,
      },
      {
        action: "COURSE_PUBLISHED",
        courseId: course2._id,
        courseTitle: course2.title,
        performedBy: instructor._id,
      },
      {
        action: "COURSE_CREATED",
        courseId: course3._id,
        courseTitle: course3.title,
        performedBy: instructor._id,
      },
    ]);

    console.log("Seeding completed successfully! Database is ready.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed with error:", error);
    process.exit(1);
  }
};

seedDatabase();
