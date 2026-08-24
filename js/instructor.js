// Check if instructor is logged in
var currentUser = getCurrentUser();
if (!currentUser || currentUser.role !== "instructor") {
  alert("Access denied.");
  window.location.href = "login.html";
} else {
  document.getElementById("welcomeMsg").textContent = "Welcome, " + currentUser.name;
}

// ── Load and save courses ──────────────────────────────────
async function getCourses() {
  return await apiGet("/courses");
}

function saveCourses(list) {
  localStorage.setItem("edustream_courses", JSON.stringify(list));
}

// My courses only
function myCourses() {
  return getCourses().filter(function(c) {
    return c.instructorId === currentUser.id;
  });
}

// ── Show section ───────────────────────────────────────────
function showSection(name) {
  var sections = ["createSection", "editSection", "publishSection", "removeSection"];
  sections.forEach(function(id) {
    document.getElementById(id).classList.add("hidden");
  });
  document.getElementById(name + "Section").classList.remove("hidden");

  if (name === "edit")    fillEditDropdown();
  if (name === "publish") fillPublishList();
  if (name === "remove")  fillRemoveList();
}

// ── Show a message for 3 seconds ──────────────────────────
function showMsg(id, text) {
  var el = document.getElementById(id);
  el.textContent = text;
  el.classList.remove("hidden");
  setTimeout(function() { el.classList.add("hidden"); }, 3000);
}

// ── Refresh the courses table ──────────────────────────────
function refreshTable() {
  var tbody = document.getElementById("courseTableBody");
  var courses = myCourses();

  if (courses.length === 0) {
    tbody.innerHTML = "<tr><td colspan='3'>No courses yet.</td></tr>";
    return;
  }

  tbody.innerHTML = "";
  courses.forEach(function(c) {
    var row = "<tr><td>" + c.title + "</td><td>" + c.category + "</td><td>" + c.status + "</td></tr>";
    tbody.innerHTML += row;
  });
}

// ── CREATE ─────────────────────────────────────────────────
function createCourse() {
  var title    = document.getElementById("courseTitle").value.trim();
  var category = document.getElementById("courseCategory").value;
  var desc     = document.getElementById("courseDesc").value.trim();

  if (!title || !category) {
    showMsg("createMsg", "Please enter a title and category.");
    return;
  }

  var course = {
    id: "course-" + Date.now(),
    instructorId: currentUser.id,
    title: title,
    category: category,
    description: desc,
    status: "draft"
  };

  var courses = getCourses();
  courses.push(course);
  saveCourses(courses);

  document.getElementById("courseTitle").value    = "";
  document.getElementById("courseCategory").value = "";
  document.getElementById("courseDesc").value     = "";

  showMsg("createMsg", "Course created as Draft!");
  refreshTable();
}

// ── EDIT ───────────────────────────────────────────────────
function fillEditDropdown() {
  var select = document.getElementById("editSelect");
  select.innerHTML = "<option value=''>-- Choose a course --</option>";

  myCourses().forEach(function(c) {
    select.innerHTML += "<option value='" + c.id + "'>" + c.title + " (" + c.status + ")</option>";
  });

  document.getElementById("editFields").classList.add("hidden");
}

function loadCourseForEdit() {
  var id = document.getElementById("editSelect").value;
  if (!id) { document.getElementById("editFields").classList.add("hidden"); return; }

  var course = getCourses().find(function(c) { return c.id === id; });
  document.getElementById("editTitle").value    = course.title;
  document.getElementById("editCategory").value = course.category;
  document.getElementById("editDesc").value     = course.description;
  document.getElementById("editFields").classList.remove("hidden");
}

function saveCourseEdit() {
  var id    = document.getElementById("editSelect").value;
  var title = document.getElementById("editTitle").value.trim();
  var cat   = document.getElementById("editCategory").value;
  var desc  = document.getElementById("editDesc").value.trim();

  if (!title || !cat) { showMsg("editMsg", "Title and category required."); return; }

  var courses = getCourses();
  courses.forEach(function(c) {
    if (c.id === id) { c.title = title; c.category = cat; c.description = desc; }
  });

  saveCourses(courses);
  showMsg("editMsg", "Course updated!");
  fillEditDropdown();
  refreshTable();
}

// ── PUBLISH ────────────────────────────────────────────────
function fillPublishList() {
  var list   = document.getElementById("publishList");
  var drafts = myCourses().filter(function(c) { return c.status === "draft"; });

  if (drafts.length === 0) { list.innerHTML = "<p>No draft courses to publish.</p>"; return; }

  list.innerHTML = "";
  drafts.forEach(function(c) {
    list.innerHTML +=
      "<div class='publish-item'>" +
        "<span>" + c.title + " — " + c.category + "</span>" +
        "<button class='button' onclick='publishCourse(\"" + c.id + "\")'>Publish</button>" +
      "</div>";
  });
}

function publishCourse(id) {
  var courses = getCourses();
  courses.forEach(function(c) { if (c.id === id) c.status = "published"; });
  saveCourses(courses);
  showMsg("publishMsg", "Course published!");
  fillPublishList();
  refreshTable();
}

// ── REMOVE ─────────────────────────────────────────────────
function fillRemoveList() {
  var list      = document.getElementById("removeList");
  var published = myCourses().filter(function(c) { return c.status === "published"; });

  if (published.length === 0) { list.innerHTML = "<p>No published courses to remove.</p>"; return; }

  list.innerHTML = "";
  published.forEach(function(c) {
    list.innerHTML +=
      "<div class='publish-item'>" +
        "<span>" + c.title + " — " + c.category + "</span>" +
        "<button class='button danger-btn' onclick='deleteCourse(\"" + c.id + "\", \"" + c.title + "\")'>Remove</button>" +
      "</div>";
  });
}

function deleteCourse(id, title) {
  if (!confirm("Are you sure you want to delete \"" + title + "\"?")) return;

  var courses = getCourses().filter(function(c) { return c.id !== id; });
  saveCourses(courses);
  showMsg("removeMsg", "\"" + title + "\" deleted.");
  fillRemoveList();
  refreshTable();
}

// ── On page load ───────────────────────────────────────────
refreshTable();
