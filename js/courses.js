const COURSES_STORAGE_KEY = "edustream_courses";
const courseGrid = document.getElementById("coursesContainer");

function getPublishedCourses() {
  const rawCourses = localStorage.getItem(COURSES_STORAGE_KEY);

  if (!rawCourses) {
    return [];
  }

  try {
    const parsedCourses = JSON.parse(rawCourses);

    if (!Array.isArray(parsedCourses)) {
      return [];
    }

    return parsedCourses.filter(function (course) {
      return course && course.status === "published";
    });
  } catch (error) {
    console.error("Unable to parse courses from localStorage.", error);
    return [];
  }
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

function renderCourses() {
  if (!courseGrid) {
    return;
  }

  const publishedCourses = getPublishedCourses();

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
    }
  });
}

document.addEventListener("DOMContentLoaded", renderCourses);
