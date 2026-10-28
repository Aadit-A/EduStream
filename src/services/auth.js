import { apiGet, apiPost, TOKEN_KEY } from "../api/api.js";

export async function getUsers() {
  return await apiGet("/users");
}

export async function registerUser(userData) {
  const newUser = {
    name: userData.name.trim(),
    email: userData.email.trim().toLowerCase(),
    password: userData.password,
    role: userData.role,
  };

  const result = await apiPost("/auth/register", newUser);

  if (!result || result.message) {
    return {
      success: false,
      message: result?.message || "Something went wrong. Please try again.",
    };
  }

  const currentUser = result.user || {
    id: result.id,
    name: result.name,
    email: result.email,
    role: result.role,
  };

  if (result.token && typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(TOKEN_KEY, result.token);
    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
  }

  return {
    success: true,
    user: currentUser,
  };
}

export async function loginUser(email, password) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const result = await apiPost("/auth/login", {
    email: normalizedEmail,
    password,
  });

  if (!result || result.message) {
    return {
      success: false,
      message: result?.message || "Invalid email or password.",
    };
  }

  const currentUser = result.user || {
    id: result.id,
    name: result.name,
    email: result.email,
    role: result.role,
  };

  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
    if (result.token) {
      sessionStorage.setItem(TOKEN_KEY, result.token);
    }
  }

  return {
    success: true,
    user: currentUser,
  };
}

// ── Session persistence helpers ──
export function getCurrentUser() {
  if (typeof sessionStorage === "undefined") {
    return null;
  }

  const rawCurrentUser = sessionStorage.getItem("currentUser");

  if (!rawCurrentUser) {
    return null;
  }

  try {
    const currentUser = JSON.parse(rawCurrentUser);
    return currentUser && typeof currentUser === "object" ? currentUser : null;
  } catch (error) {
    console.error("Unable to parse current user from sessionStorage.", error);
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getCurrentUser());
}

export function logoutUser(redirect = true) {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem(TOKEN_KEY);
  }
  if (redirect && typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export function requireLogin() {
  if (!isLoggedIn()) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return false;
  }
  return true;
}

export function requireRole(requiredRole) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return false;
  }

  if (currentUser.role !== requiredRole) {
    return false;
  }

  return true;
}
