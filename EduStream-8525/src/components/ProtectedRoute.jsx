import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, requiredRole }) {
  const { currentUser, isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <main className="page-shell">
        <p className="placeholder-text">Loading...</p>
      </main>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && currentUser?.role !== requiredRole) {
    alert("Access denied.");
    return <Navigate to="/login" replace />;
  }

  return children;
}
