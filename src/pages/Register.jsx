import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [successRole, setSuccessRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmailFormat = (emailValue) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(emailValue);
  };

  const validateRegistrationForm = (data) => {
    let isValid = true;
    const newErrors = { name: "", email: "", password: "", role: "" };

    if (!data.name.trim()) {
      newErrors.name = "Name is required.";
      isValid = false;
    }

    if (!data.email.trim()) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!validateEmailFormat(data.email.trim())) {
      newErrors.email = "Please enter a valid email.";
      isValid = false;
    }

    if (!data.password) {
      newErrors.password = "Password is required.";
      isValid = false;
    }

    if (!data.role) {
      newErrors.role = "Please select a role.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessRole(null);

    const isValid = validateRegistrationForm(formData);
    if (!isValid) return;

    setIsSubmitting(true);
    const result = await register(formData);
    setIsSubmitting(false);

    if (!result.success) {
      setErrors((prev) => ({ ...prev, email: result.message }));
      return;
    }

    setSuccessRole(result.user.role);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
    });
  };

  return (
    <main className="page-shell">
      <section className="form-card">
        <p className="eyebrow">Create an account</p>
        <h1>Register</h1>

        <form id="registerForm" noValidate onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Full name"
              value={formData.name}
              onChange={handleChange}
              aria-invalid={Boolean(errors.name)}
            />
            <p className={`field-error ${errors.name ? "has-error" : ""}`} id="nameError">
              {errors.name}
            </p>
          </div>

          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
            />
            <p className={`field-error ${errors.email ? "has-error" : ""}`} id="emailError">
              {errors.email}
            </p>
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              aria-invalid={Boolean(errors.password)}
            />
            <p className={`field-error ${errors.password ? "has-error" : ""}`} id="passwordError">
              {errors.password}
            </p>
          </div>

          <div className="field-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              aria-invalid={Boolean(errors.role)}
            >
              <option value="">Select a role</option>
              <option value="instructor">Instructor</option>
              <option value="student">Student</option>
            </select>
            <p className={`field-error ${errors.role ? "has-error" : ""}`} id="roleError">
              {errors.role}
            </p>
          </div>

          <button
            type="submit"
            className="button primary wide-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        <div
          id="successMessage"
          className={`success-message ${successRole ? "" : "hidden"}`}
          aria-live="polite"
        >
          <p>Registration successful for {successRole}.</p>
          <Link to="/login" className="button secondary" style={{ textDecoration: "none", display: "inline-block" }}>
            Go to Login
          </Link>
        </div>

        <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--text-soft)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--black)", fontWeight: 600 }}>
            Login here
          </Link>
        </p>
      </section>
    </main>
  );
}
