import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet } from "../api/api.js";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [sortDirection, setSortDirection] = useState("az");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoading(true);
    const allCourses = await apiGet("/courses");
    const published = (Array.isArray(allCourses) ? allCourses : []).filter(
      (course) => course && course.status === "published"
    );
    setCourses(published);
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const sortedCourses = [...courses].sort((a, b) => {
    const aTitle = (a.title || "").toLowerCase();
    const bTitle = (b.title || "").toLowerCase();

    if (aTitle < bTitle) return sortDirection === "az" ? -1 : 1;
    if (aTitle > bTitle) return sortDirection === "az" ? 1 : -1;
    return 0;
  });

  return (
    <main className="page-shell">
      <section className="page-hero">
        <p className="eyebrow">Student Portal</p>
        <h1>Published Courses</h1>
        <p>Explore the latest learning resources available to students.</p>
      </section>

      <div className="sort-row">
        <label htmlFor="sortCourses">Sort by title:</label>
        <select
          id="sortCourses"
          value={sortDirection}
          onChange={(e) => setSortDirection(e.target.value)}
        >
          <option value="az">A-Z</option>
          <option value="za">Z-A</option>
        </select>
      </div>

      <p id="courseCount" className="course-count">
        Published Courses: {loading ? "..." : sortedCourses.length}
      </p>

      {loading ? (
        <div className="empty-state">
          <p>Loading published courses...</p>
        </div>
      ) : sortedCourses.length === 0 ? (
        <div className="empty-state">
          <p>No published courses are available right now.</p>
        </div>
      ) : (
        <section id="coursesContainer" className="courses-grid" aria-live="polite">
          {sortedCourses.map((course) => {
            const title = course.title || "Untitled Course";
            const category = course.category || "General";
            const description = course.description || "No description available.";
            const courseId = encodeURIComponent(course.id || "");

            return (
              <article
                key={course.id}
                className="course-card"
                data-course-id={course.id || ""}
              >
                <div className="course-meta">
                  <span className="course-tag">{category}</span>
                </div>
                <h2>{title}</h2>
                <p className="course-description">{description}</p>
                <Link
                  to={`/course-details?id=${courseId}`}
                  className="button secondary course-link"
                  aria-label={`View details for ${course.id || ""}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/course-details?id=${courseId}`);
                    }
                  }}
                >
                  View Details
                </Link>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
