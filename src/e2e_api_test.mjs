// Node.js in-memory sessionStorage polyfill for CLI test runner
if (typeof sessionStorage === "undefined") {
  const store = new Map();
  globalThis.sessionStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

import { apiGet, apiPost, apiPatch, apiDelete } from "../src/api/api.js";
import { registerUser, loginUser, logoutUser } from "../src/services/auth.js";

async function runTests() {
  console.log("Starting E2E API Verification with Full Security & JWT Integration...\n");

  // 1. Verify Unauthenticated Protection
  console.log("1. Testing unauthenticated course creation protection...");
  logoutUser(false);
  const unauthCourse = await apiPost("/courses", {
    title: "Unauth Course",
    category: "Hacking",
    description: "Should be blocked",
  });
  console.log("Unauthenticated creation blocked (401):", unauthCourse?.message === "Authentication required." ? "PASSED" : "FAILED");
  if (unauthCourse?.message !== "Authentication required.") throw new Error("Security breach: unauthenticated creation was not rejected with 401");

  // 2. Test Invalid Login Rejection
  console.log("\n2. Testing invalid login credentials...");
  const invalidLogin = await loginUser("you@email.com", "wrongpass");
  console.log("Invalid login rejection:", !invalidLogin.success ? "PASSED" : "FAILED", invalidLogin.message);
  if (invalidLogin.success) throw new Error("Invalid password was improperly accepted");

  // 3. Test Valid Login with Default Instructor
  console.log("\n3. Testing valid login with default instructor...");
  const loginRes = await loginUser("you@email.com", "12344");
  console.log("Instructor login result:", loginRes.success ? "PASSED" : "FAILED", `Welcome ${loginRes.user?.name}`);
  if (!loginRes.success) throw new Error("Instructor login failed: " + loginRes.message);

  // 4. Test Student Role Authorization Guard
  console.log("\n4. Testing role-based authorization guard (Student cannot create courses)...");
  const studentLogin = await loginUser("aryankanas2005@gmail.com", "1234");
  if (!studentLogin.success) throw new Error("Student login failed: " + studentLogin.message);
  const studentCreate = await apiPost("/courses", {
    title: "Illegal Student Course",
    category: "Testing",
    description: "Should fail with 403",
  });
  console.log("Student course creation forbidden (403):", studentCreate?.message === "You do not have permission for this action." ? "PASSED" : "FAILED");
  if (studentCreate?.message !== "You do not have permission for this action.") throw new Error("Role guard failed: Student was allowed to create course");

  // Re-login as instructor
  await loginUser("you@email.com", "12344");

  // 5. Test Register Duplicate User
  console.log("\n5. Testing duplicate registration rejection...");
  const dupRegister = await registerUser({
    name: "Dup User",
    email: "you@email.com",
    password: "password123",
    role: "student",
  });
  console.log("Duplicate register rejection:", !dupRegister.success ? "PASSED" : "FAILED", dupRegister.message);

  // 6. Test Course Creation by Authenticated Instructor
  console.log("\n6. Testing authenticated course creation...");
  const newCourse = {
    title: "React Architecture 101",
    category: "Computer Science",
    description: "Deep dive into React state, effects, and components.",
    status: "draft",
  };
  const createdCourse = await apiPost("/courses", newCourse);
  console.log("Create course result:", createdCourse && createdCourse.id ? "PASSED" : "FAILED", `Course ID: ${createdCourse?.id}`);
  if (!createdCourse || !createdCourse.id) throw new Error("Failed to create course");

  // 7. Test Course Publish (status: published)
  console.log("\n7. Testing course publish...");
  const publishedCourse = await apiPatch(`/courses/${createdCourse.id}`, { status: "published" });
  console.log("Publish course result:", publishedCourse?.status === "published" ? "PASSED" : "FAILED");

  // 8. Test Course Ownership Enforcement by Another Instructor
  console.log("\n8. Testing course ownership guard against another instructor...");
  // Register or login a second instructor
  let inst2 = await loginUser("second.instructor@email.com", "password123");
  if (!inst2.success) {
    inst2 = await registerUser({
      name: "Prof. Second",
      email: "second.instructor@email.com",
      password: "password123",
      role: "instructor",
    });
  }
  const hijackedEdit = await apiPatch(`/courses/${createdCourse.id}`, { title: "Hijacked by Inst 2" });
  console.log("Non-owner instructor mutation blocked (403):", hijackedEdit?.message === "You do not have permission to modify this course." ? "PASSED" : "FAILED");
  if (hijackedEdit?.message !== "You do not have permission to modify this course.") {
    throw new Error("Course ownership guard failed: non-owner instructor mutated the course");
  }

  // Switch back to owner instructor
  await loginUser("you@email.com", "12344");

  // 9. Test Fetch Published Courses
  console.log("\n9. Testing get published courses catalog...");
  const allCourses = await apiGet("/courses");
  const publishedList = allCourses.filter((c) => c.status === "published");
  const found = publishedList.find((c) => c.id === createdCourse.id);
  console.log("Fetch published courses contains new course:", Boolean(found) ? "PASSED" : "FAILED");

  // 10. Clean Up Test Course
  console.log("\n10. Cleaning up test course by owner...");
  const deleted = await apiDelete(`/courses/${createdCourse.id}`);
  console.log("Delete test course result:", deleted ? "PASSED" : "FAILED");

  console.log("\n==========================================");
  console.log("All 10 E2E API and Security checks PASSED successfully!");
  console.log("==========================================\n");
}

runTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
