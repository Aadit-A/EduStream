import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiGet, apiPost, apiPatch, apiDelete } from "../api/api.js";

const CATEGORIES = [
  "Mathematics",
  "Science",
  "English Language",
  "History",
  "Geography",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
];

export default function Instructor() {
  const { currentUser, logout, loading } = useAuth();
  const navigate = useNavigate();

  // Active section: 'create', 'edit', 'publish', 'remove', or null
  const [activeSection, setActiveSection] = useState("create");
  const [courses, setCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({ title: "", category: "", desc: "" });
  const [selectedEditId, setSelectedEditId] = useState("");
  const [editForm, setEditForm] = useState({ title: "", category: "", desc: "" });

  // Timed notification messages
  const [messages, setMessages] = useState({
    createMsg: "",
    editMsg: "",
    publishMsg: "",
    removeMsg: "",
  });

  const showMsg = (key, text) => {
    setMessages((prev) => ({ ...prev, [key]: text }));
    setTimeout(() => {
      setMessages((prev) => ({ ...prev, [key]: "" }));
    }, 3000);
  };

  // Auth enforcement
  useEffect(() => {
    if (!loading) {
      if (!currentUser || currentUser.role !== "instructor") {
        alert("Access denied.");
        navigate("/login");
      }
    }
  }, [currentUser, loading, navigate]);

  // Load instructor courses
  const fetchMyCourses = useCallback(async () => {
    if (!currentUser?.id) return;
    setIsLoadingCourses(true);
    const allCourses = await apiGet("/courses");
    const my = (Array.isArray(allCourses) ? allCourses : []).filter(
      (c) => c && c.instructorId === currentUser.id
    );
    setCourses(my);
    setIsLoadingCourses(false);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchMyCourses();
    }
  }, [currentUser, fetchMyCourses]);

  // Section toggle
  const handleShowSection = (sectionName) => {
    setActiveSection(sectionName);
    if (sectionName === "edit") {
      setSelectedEditId("");
      setEditForm({ title: "", category: "", desc: "" });
    }
  };

  // ── CREATE COURSE ─────────────────────────────────────────
  const handleCreateCourse = async () => {
    const title = createForm.title.trim();
    const category = createForm.category;
    const desc = createForm.desc.trim();

    if (!title || !category) {
      showMsg("createMsg", "Please enter a title and category.");
      return;
    }

    const courseData = {
      instructorId: currentUser.id,
      title: title,
      category: category,
      description: desc,
      status: "draft",
    };

    const result = await apiPost("/courses", courseData);

    if (!result) {
      showMsg("createMsg", "Something went wrong, try again.");
      return;
    }

    setCreateForm({ title: "", category: "", desc: "" });
    showMsg("createMsg", "Course created as Draft!");
    await fetchMyCourses();
  };

  // ── EDIT COURSE ───────────────────────────────────────────
  const handleSelectCourseForEdit = (id) => {
    setSelectedEditId(id);
    if (!id) {
      setEditForm({ title: "", category: "", desc: "" });
      return;
    }
    const found = courses.find((c) => String(c.id) === String(id));
    if (found) {
      setEditForm({
        title: found.title || "",
        category: found.category || "",
        desc: found.description || "",
      });
    }
  };

  const handleSaveCourseEdit = async () => {
    const id = selectedEditId;
    const title = editForm.title.trim();
    const cat = editForm.category;
    const desc = editForm.desc.trim();

    if (!title || !cat) {
      showMsg("editMsg", "Title and category required.");
      return;
    }

    const result = await apiPatch(`/courses/${id}`, {
      title: title,
      category: cat,
      description: desc,
    });

    if (!result) {
      showMsg("editMsg", "Something went wrong, try again.");
      return;
    }

    showMsg("editMsg", "Course updated!");
    await fetchMyCourses();
  };

  // ── PUBLISH COURSE ─────────────────────────────────────────
  const handlePublishCourse = async (id) => {
    const result = await apiPatch(`/courses/${id}`, { status: "published" });

    if (!result) {
      showMsg("publishMsg", "Something went wrong, try again.");
      return;
    }

    showMsg("publishMsg", "Course published!");
    await fetchMyCourses();
  };

  // ── REMOVE COURSE ──────────────────────────────────────────
  const handleDeleteCourse = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    const ok = await apiDelete(`/courses/${id}`);

    if (!ok) {
      showMsg("removeMsg", "Something went wrong, try again.");
      return;
    }

    showMsg("removeMsg", `"${title}" deleted.`);
    await fetchMyCourses();
  };

  const draftCourses = courses.filter((c) => c.status === "draft");
  const publishedCourses = courses.filter((c) => c.status === "published");

  if (loading || !currentUser) {
    return (
      <main className="page-shell">
        <p className="placeholder-text">Loading instructor dashboard...</p>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <p className="eyebrow">Instructor Panel</p>
      <h1>Course Management</h1>

      <div className="action-bar">
        <button
          type="button"
          className={`button ${activeSection === "create" ? "" : "secondary"}`}
          onClick={() => handleShowSection("create")}
        >
          Create Course
        </button>
        <button
          type="button"
          className={`button ${activeSection === "edit" ? "" : "secondary"}`}
          onClick={() => handleShowSection("edit")}
        >
          Edit Course
        </button>
        <button
          type="button"
          className={`button ${activeSection === "publish" ? "" : "secondary"}`}
          onClick={() => handleShowSection("publish")}
        >
          Publish Course
        </button>
        <button
          type="button"
          className={`button secondary ${activeSection === "remove" ? "danger-btn" : ""}`}
          onClick={() => handleShowSection("remove")}
        >
          Remove Course
        </button>
      </div>

      {/* CREATE SECTION */}
      <section
        id="createSection"
        className={`course-section ${activeSection === "create" ? "" : "hidden"}`}
      >
        <h2>Create a New Course</h2>
        <div className="field-group">
          <label htmlFor="courseTitle">Course Title</label>
          <input
            type="text"
            id="courseTitle"
            placeholder="e.g. JavaScript for Beginners"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
          />
        </div>
        <div className="field-group">
          <label htmlFor="courseCategory">Category</label>
          <select
            id="courseCategory"
            value={createForm.category}
            onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
          >
            <option value="">-- Select --</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label htmlFor="courseDesc">Description</label>
          <textarea
            id="courseDesc"
            placeholder="Brief description of the course..."
            value={createForm.desc}
            onChange={(e) => setCreateForm({ ...createForm, desc: e.target.value })}
          />
        </div>
        <button type="button" className="button" onClick={handleCreateCourse}>
          Save Course
        </button>
        {messages.createMsg && (
          <p id="createMsg" className="msg">
            {messages.createMsg}
          </p>
        )}
      </section>

      {/* EDIT SECTION */}
      <section
        id="editSection"
        className={`course-section ${activeSection === "edit" ? "" : "hidden"}`}
      >
        <h2>Edit a Course</h2>
        <div className="field-group">
          <label htmlFor="editSelect">Select Course</label>
          <select
            id="editSelect"
            value={selectedEditId}
            onChange={(e) => handleSelectCourseForEdit(e.target.value)}
          >
            <option value="">-- Choose a course --</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.status})
              </option>
            ))}
          </select>
        </div>

        <div id="editFields" className={selectedEditId ? "" : "hidden"}>
          <div className="field-group">
            <label htmlFor="editTitle">Title</label>
            <input
              type="text"
              id="editTitle"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
          </div>
          <div className="field-group">
            <label htmlFor="editCategory">Category</label>
            <select
              id="editCategory"
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label htmlFor="editDesc">Description</label>
            <textarea
              id="editDesc"
              value={editForm.desc}
              onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })}
            />
          </div>
          <button type="button" className="button" onClick={handleSaveCourseEdit}>
            Update Course
          </button>
        </div>
        {messages.editMsg && (
          <p id="editMsg" className="msg">
            {messages.editMsg}
          </p>
        )}
      </section>

      {/* PUBLISH SECTION */}
      <section
        id="publishSection"
        className={`course-section ${activeSection === "publish" ? "" : "hidden"}`}
      >
        <h2>Publish a Course</h2>
        <p className="placeholder-text">Select a draft course below to publish it.</p>
        <div id="publishList" className="course-list">
          {draftCourses.length === 0 ? (
            <p>No draft courses to publish.</p>
          ) : (
            draftCourses.map((c) => (
              <div key={c.id} className="publish-item">
                <span>
                  {c.title} — {c.category}
                </span>
                <button
                  type="button"
                  className="button"
                  onClick={() => handlePublishCourse(c.id)}
                >
                  Publish
                </button>
              </div>
            ))
          )}
        </div>
        {messages.publishMsg && (
          <p id="publishMsg" className="msg">
            {messages.publishMsg}
          </p>
        )}
      </section>

      {/* REMOVE SECTION */}
      <section
        id="removeSection"
        className={`course-section ${activeSection === "remove" ? "" : "hidden"}`}
      >
        <h2>Remove a Published Course</h2>
        <p className="placeholder-text">Published courses listed below. Click Remove to delete.</p>
        <div id="removeList" className="course-list">
          {publishedCourses.length === 0 ? (
            <p>No published courses to remove.</p>
          ) : (
            publishedCourses.map((c) => (
              <div key={c.id} className="publish-item">
                <span>
                  {c.title} — {c.category}
                </span>
                <button
                  type="button"
                  className="button danger-btn"
                  onClick={() => handleDeleteCourse(c.id, c.title)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
        {messages.removeMsg && (
          <p id="removeMsg" className="msg">
            {messages.removeMsg}
          </p>
        )}
      </section>

      {/* MY COURSES TABLE */}
      <section className="course-section table-section">
        <h2>My Courses</h2>
        <table id="courseTable">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="courseTableBody">
            {isLoadingCourses ? (
              <tr>
                <td colSpan="3" className="placeholder-text">
                  Loading courses...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan="3" className="placeholder-text">
                  No courses yet.
                </td>
              </tr>
            ) : (
              courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td>{c.category}</td>
                  <td>
                    <span
                      className={`badge ${
                        c.status === "published" ? "badge-published" : "badge-draft"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
