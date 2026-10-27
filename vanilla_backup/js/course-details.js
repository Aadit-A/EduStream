const courseTitle = document.getElementById("courseTitle");
const courseCategory = document.getElementById("courseCategory");
const courseDescription = document.getElementById("courseDescription");
const courseError = document.getElementById("courseError");
const backToCoursesButton = document.getElementById("backToCoursesButton");

function getSelectedCourseId() {
  const params = new URLSearchParams(window.location.search);
  const rawId = params.get("id");

  if (!rawId) return "";
  return decodeURIComponent(rawId);
}

async function getCourseList() {
  return await apiGet("/courses");
}

function showError(message) {
  if (!courseError) return;

  courseError.textContent = message;
  courseError.classList.remove("hidden");

  if (courseTitle) courseTitle.textContent = "Course not found";
  if (courseCategory) courseCategory.textContent = "-";
  if (courseDescription) courseDescription.textContent = "The requested course could not be loaded.";
}

async function renderCourseDetails() {
  const selectedCourseId = getSelectedCourseId();

  if (!selectedCourseId) {
    showError("No course was selected.");
    return;
  }

  const courses = await getCourseList();
  const course = courses.find(function (item) {
    return item && item.id == selectedCourseId && item.status === "published";
  });

  if (!course) {
    showError("The selected course is unavailable or has not been published.");
    return;
  }

  if (courseTitle) courseTitle.textContent = course.title || "Untitled Course";
  if (courseCategory) courseCategory.textContent = course.category || "General";
  if (courseDescription) courseDescription.textContent = course.description || "No description available.";

  if (courseError) {
    courseError.classList.add("hidden");
    courseError.textContent = "";
  }
}

function bindBackNavigation() {
  if (!backToCoursesButton) return;

  backToCoursesButton.addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = "courses.html";
  });

  backToCoursesButton.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      window.location.href = "courses.html";
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderCourseDetails();
  bindBackNavigation();
});