async function getPublishedCourses() {
  const allCourses = await apiGet("/courses");
  return allCourses.filter(function (course) {
    return course && course.status === "published";
  });
}

function sortCourses(courses, direction) {
  const sortedCourses = courses.slice();

  sortedCourses.sort(function (a, b) {
    const aTitle = (a.title || "").toLowerCase();
    const bTitle = (b.title || "").toLowerCase();

    if (aTitle < bTitle) return direction === "az" ? -1 : 1;
    if (aTitle > bTitle) return direction === "az" ? 1 : -1;
    return 0;
  });

  return sortedCourses;
}

function buildCourseCard(course) {
  const title = course.title || "Untitled Course";
  const category = course.category || "General";
  const description = course.description || "No description available.";
  const courseId = encodeURIComponent(course.id || "");

  return `
    <article class="course-card" data-course-id="${course.id || ""}">
      <div class="course-meta">
        <span class="course-tag">${category}</span>
      </div>
      <h2>${title}</h2>
      <p class="course-description">${description}</p>
      <a class="button secondary course-link" href="course-details.html?id=${courseId}">View Details</a>
    </article>
  `;
}

async function renderCourses() {
  const courseGrid = document.getElementById("coursesContainer");
  const sortCoursesSelect = document.getElementById("sortCourses");
  const courseCount = document.getElementById("courseCount");

  if (!courseGrid) return;

  const direction = sortCoursesSelect ? sortCoursesSelect.value : "az";
  const publishedCourses = sortCourses(await getPublishedCourses(), direction);

  if (courseCount) {
    courseCount.textContent = "Published Courses: " + publishedCourses.length;
  }

  if (publishedCourses.length === 0) {
    courseGrid.innerHTML = `
      <div class="empty-state">
        <p>No published courses are available right now.</p>
      </div>
    `;
    return;
  }

  const cardsMarkup = publishedCourses.map(function (course) {
    return buildCourseCard(course);
  }).join("");

  courseGrid.innerHTML = cardsMarkup;

  const renderedCards = courseGrid.querySelectorAll(".course-card");
  renderedCards.forEach(function (card) {
    const detailsButton = card.querySelector(".course-link");
    if (detailsButton) {
      detailsButton.setAttribute("aria-label", "View details for " + card.dataset.courseId);

      detailsButton.addEventListener("keydown", function (event) {
        const link = event.target.closest(".course-link");
        if (link && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          window.location.href = link.getAttribute("href");
        }
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const sortCoursesSelect = document.getElementById("sortCourses");
  if (sortCoursesSelect) {
    sortCoursesSelect.addEventListener("change", renderCourses);
  }
  renderCourses();
});