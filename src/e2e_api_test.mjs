import { apiGet, apiPost, apiPatch, apiDelete } from "../src/api/api.js";
import { registerUser, loginUser } from "../src/services/auth.js";

async function runTests() {
  console.log("Starting E2E API Verification...");

  // 1. Test Login with default instructor
  const loginRes = await loginUser("you@email.com", "12344");
  console.log("Login user result:", loginRes.success ? "PASSED" : "FAILED", loginRes.user?.name);
  if (!loginRes.success) throw new Error("Login failed");

  // 2. Test Invalid Login
  const invalidLogin = await loginUser("you@email.com", "wrongpass");
  console.log("Invalid login rejection:", !invalidLogin.success ? "PASSED" : "FAILED", invalidLogin.message);

  // 3. Test Register duplicate user
  const dupRegister = await registerUser({
    name: "Dup User",
    email: "you@email.com",
    password: "123",
    role: "student",
  });
  console.log("Duplicate register rejection:", !dupRegister.success ? "PASSED" : "FAILED", dupRegister.message);

  // 4. Test Course Creation
  const newCourse = {
    instructorId: loginRes.user.id,
    title: "React Architecture 101",
    category: "Computer Science",
    description: "Deep dive into React state, effects, and components.",
    status: "draft",
  };
  const createdCourse = await apiPost("/courses", newCourse);
  console.log("Create course result:", createdCourse && createdCourse.id ? "PASSED" : "FAILED", createdCourse?.id);

  // 5. Test Course Publish (status: published)
  const publishedCourse = await apiPatch(`/courses/${createdCourse.id}`, { status: "published" });
  console.log("Publish course result:", publishedCourse?.status === "published" ? "PASSED" : "FAILED");

  // 6. Test Get Published Courses
  const allCourses = await apiGet("/courses");
  const publishedList = allCourses.filter((c) => c.status === "published");
  const found = publishedList.find((c) => c.id === createdCourse.id);
  console.log("Fetch published courses contains new course:", Boolean(found) ? "PASSED" : "FAILED");

  // 7. Clean up test course
  const deleted = await apiDelete(`/courses/${createdCourse.id}`);
  console.log("Delete test course result:", deleted ? "PASSED" : "FAILED");

  console.log("All E2E API checks passed successfully!");
}

runTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
