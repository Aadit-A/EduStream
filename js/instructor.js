// Check if instructor is logged in
var currentUser = getCurrentUser();
if (!currentUser || currentUser.role !== "instructor") {
  alert("Access denied.");
  window.location.href = "login.html";
} else {
  document.getElementById("welcomeMsg").textContent = "Welcome, " + currentUser.name;
}

// ── Load courses ─────────────────────────────────────────
async function getCourses() {
  return await apiGet("/courses");
}

// My courses only
async function myCourses() {
  const courses = await getCourses();
  return courses.filter(function(c) {
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
async function refreshTable() {
  var tbody = document.getElementById("courseTableBody");
  var courses = await myCourses();

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
async function createCourse() {
  var title    = document.getElementById("courseTitle").value.trim();
  var category = document.getElementById("courseCategory").value;
  var desc     = document.getElementById("courseDesc").value.trim();

  if (!title || !category) {
    showMsg("createMsg", "Please enter a title and category.");
    return;
  }

  var course = {
    instructorId: currentUser.id,
    title: title,
    category: category,
    description: desc,
    status: "draft"
  };

  var result = await apiPost("/courses", course);

  if (!result) {
    showMsg("createMsg", "Something went wrong, try again.");
    return;
  }

  document.getElementById("courseTitle").value    = "";
  document.getElementById("courseCategory").value = "";
  document.getElementById("courseDesc").value     = "";

  showMsg("createMsg", "Course created as Draft!");
  await refreshTable();
}

// ── EDIT ───────────────────────────────────────────────────
async function fillEditDropdown() {
  var select = document.getElementById("editSelect");
  select.innerHTML = "<option value=''>-- Choose a course --</option>";

  var courses = await myCourses();
  courses.forEach(function(c) {
    select.innerHTML += "<option value='" + c.id + "'>" + c.title + " (" + c.status + ")</option>";
  });

  document.getElementById("editFields").classList.add("hidden");
}

async function loadCourseForEdit() {
  var id = document.getElementById("editSelect").value;
  if (!id) { document.getElementById("editFields").classList.add("hidden"); return; }

  var courses = await getCourses();
  var course = courses.find(function(c) { return c.id == id; });
  document.getElementById("editTitle").value    = course.title;
  document.getElementById("editCategory").value = course.category;
  document.getElementById("editDesc").value     = course.description;
  document.getElementById("editFields").classList.remove("hidden");
}

async function saveCourseEdit() {
  var id    = document.getElementById("editSelect").value;
  var title = document.getElementById("editTitle").value.trim();
  var cat   = document.getElementById("editCategory").value;
  var desc  = document.getElementById("editDesc").value.trim();

  if (!title || !cat) { showMsg("editMsg", "Title and category required."); return; }

  var result = await apiPatch("/courses/" + id, {
    title: title,
    category: cat,
    description: desc
  });

  if (!result) {
    showMsg("editMsg", "Something went wrong, try again.");
    return;
  }

  showMsg("editMsg", "Course updated!");
  await fillEditDropdown();
  await refreshTable();
}

// ── PUBLISH ────────────────────────────────────────────────
async function fillPublishList() {
  var list   = document.getElementById("publishList");
  var courses = await myCourses();
  var drafts = courses.filter(function(c) { return c.status === "draft"; });

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

async function publishCourse(id) {
  var result = await apiPatch("/courses/" + id, { status: "published" });

  if (!result) {
    showMsg("publishMsg", "Something went wrong, try again.");
    return;
  }

  showMsg("publishMsg", "Course published!");
  await fillPublishList();
  await refreshTable();
}

// ── REMOVE ─────────────────────────────────────────────────
async function fillRemoveList() {
  var list      = document.getElementById("removeList");
  var courses = await myCourses();
  var published = courses.filter(function(c) { return c.status === "published"; });

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

async function deleteCourse(id, title) {
  if (!confirm("Are you sure you want to delete \"" + title + "\"?")) return;

  var ok = await apiDelete("/courses/" + id);

  if (!ok) {
    showMsg("removeMsg", "Something went wrong, try again.");
    return;
  }

  showMsg("removeMsg", "\"" + title + "\" deleted.");
  await fillRemoveList();
  await refreshTable();
}

// ── On page load ───────────────────────────────────────────
refreshTable();