import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { apiGet } from "../api/api.js";

export default function CourseDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const selectedCourseId = searchParams.get("id") ? decodeURIComponent(searchParams.get("id")) : "";

  useEffect(() => {
    async function fetchCourseDetails() {
      if (!selectedCourseId) {
        setError("No course was selected.");
        setLoading(false);
        return;
      }

      setLoading(true);
      const courses = await apiGet("/courses");
      const foundCourse = (Array.isArray(courses) ? courses : []).find(
        (item) => item && String(item.id) === String(selectedCourseId) && item.status === "published"
      );

      if (!foundCourse) {
        setError("The selected course is unavailable or has not been published.");
        setCourse(null);
      } else {
        setCourse(foundCourse);
        setError("");
      }
      setLoading(false);
    }

    fetchCourseDetails();
  }, [selectedCourseId]);

  const handleBack = (e) => {
    e?.preventDefault();
    navigate("/courses");
  };

  const titleText = loading
    ? "Loading course..."
    : error
    ? "Course not found"
    : course?.title || "Untitled Course";

  const categoryText = loading ? "-" : error ? "-" : course?.category || "General";

  const descriptionText = loading
    ? "Loading description..."
    : error
    ? "The requested course could not be loaded."
    : course?.description || "No description available.";

  return (
    <main className="page-shell">
      <section className="intro-card" id="courseDetailCard">
        <p className="eyebrow">Course Overview</p>
        <h1 id="courseTitle">{titleText}</h1>

        <div className="detail-field" data-detail-field="category">
          <strong>Category:</strong>
          <span id="courseCategory">{categoryText}</span>
        </div>

        <div className="detail-field" data-detail-field="description">
          <strong>Description:</strong>
          <p id="courseDescription">{descriptionText}</p>
        </div>

        <button
          type="button"
          className="button secondary"
          id="backToCoursesButton"
          onClick={handleBack}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleBack(e);
            }
          }}
        >
          Back to Courses
        </button>
      </section>

      <p
        id="courseError"
        className={`success-message ${error ? "" : "hidden"}`}
        role="alert"
        style={{
          borderColor: "#fca5a5",
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          maxWidth: "540px",
          margin: "1.5rem auto 0",
        }}
      >
        {error}
      </p>
    </main>
  );
}
