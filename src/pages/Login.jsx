import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [successInfo, setSuccessInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateLoginForm = (email, password) => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    if (!email.trim()) {
      newErrors.email = "Email is required.";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessInfo(null);

    const email = formData.email;
    const password = formData.password;

    if (!validateLoginForm(email, password)) return;

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrors({
        email: result.message,
        password: "",
      });
      return;
    }

    setFormData({ email: "", password: "" });

    if (result.user.role === "instructor") {
      navigate("/instructor");
      return;
    }

    if (result.user.role === "student") {
      navigate("/courses");
      return;
    }

    setSuccessInfo(`Welcome, ${result.user.name} (${result.user.role})`);
  };

  return (
    <main className="page-shell">
      <section className="form-card">
        <p className="eyebrow">Access your account</p>
        <h1>Login</h1>

        <form id="loginForm" noValidate onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="loginEmail">Email</label>
            <input
              id="loginEmail"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
            />
            <p
              className={`field-error ${errors.email ? "has-error" : ""}`}
              id="loginEmailError"
            >
              {errors.email}
            </p>
          </div>

          <div className="field-group">
            <label htmlFor="loginPassword">Password</label>
            <input
              id="loginPassword"
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              aria-invalid={Boolean(errors.password)}
            />
            <p
              className={`field-error ${errors.password ? "has-error" : ""}`}
              id="loginPasswordError"
            >
              {errors.password}
            </p>
          </div>

          <button
            type="submit"
            className="button primary wide-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <div
          id="loginSuccess"
          className={`success-message ${successInfo ? "" : "hidden"}`}
          aria-live="polite"
        >
          <p>Login successful.</p>
          <p id="loginUserDetails">{successInfo}</p>
        </div>

        <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-soft)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--black)", fontWeight: 600 }}>
            Register here
          </Link>
        </p>
      </section>
    </main>
  );
}
