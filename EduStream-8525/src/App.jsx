import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Courses from "./pages/Courses.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import Instructor from "./pages/Instructor.jsx";

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Routes>
        {/* Home / Protected Dashboard */}
        <Route path="/" element={<Home />} />
        <Route path="/index.html" element={<Home />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/login.html" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register.html" element={<Register />} />

        {/* Courses */}
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses.html" element={<Courses />} />
        <Route path="/course-details" element={<CourseDetails />} />
        <Route path="/course-details.html" element={<CourseDetails />} />

        {/* Instructor Dashboard */}
        <Route
          path="/instructor"
          element={
            <ProtectedRoute requiredRole="instructor">
              <Instructor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor.html"
          element={
            <ProtectedRoute requiredRole="instructor">
              <Instructor />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
