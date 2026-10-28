import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { currentUser, isLoggedIn, logout, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading || !currentUser) {
    return (
      <main className="page-shell">
        <p className="placeholder-text">Loading session...</p>
      </main>
    );
  }

  return (
    <main className="page-shell" id="protectedDashboard">
      <section className="intro-card">
        <p className="eyebrow">Authenticated area</p>
        <h1 id="welcomeMessage">Welcome, {currentUser.name}</h1>
        <p id="roleMessage">Role: {currentUser.role}</p>
        <p id="sessionStatusText">Logged in: Yes</p>

        <div className="actions" style={{ marginTop: "1.5rem" }}>
          {currentUser.role === "instructor" ? (
            <Link to="/instructor" className="button" style={{ textDecoration: "none" }}>
              Go to Instructor Panel
            </Link>
          ) : (
            <Link to="/courses" className="button" style={{ textDecoration: "none" }}>
              Browse Courses
            </Link>
          )}
          <button
            type="button"
            className="button secondary"
            id="logoutButton"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </section>
    </main>
  );
}
