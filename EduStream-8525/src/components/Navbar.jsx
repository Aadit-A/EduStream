import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { currentUser, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="site-header">
      <nav className="top-nav">
        <Link to="/" className="brand">
          <span>EduStream LMS</span>
          <span className="brand-badge">React</span>
        </Link>
        <div className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/courses">Browse Courses</NavLink>

          {!isLoggedIn ? (
            <>
              <NavLink to="/register">Register</NavLink>
              <NavLink to="/login">Login</NavLink>
            </>
          ) : (
            <>
              {currentUser?.role === "instructor" && (
                <NavLink to="/instructor">Instructor Panel</NavLink>
              )}
              <span id="welcomeMsg" className="user-badge-header">
                Welcome, {currentUser?.name}
              </span>
              <button
                type="button"
                className="button secondary"
                onClick={handleLogout}
                style={{ padding: "0.45rem 0.9rem", fontSize: "0.875rem" }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
