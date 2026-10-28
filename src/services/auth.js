import { apiGet, apiPost } from "../api/api.js";

export async function getUsers() {
  return await apiGet("/users");
}

export async function registerUser(userData) {
  const users = await getUsers();
  const duplicateUser = users.some(function (user) {
    return user.email.toLowerCase() === userData.email.toLowerCase();
  });

  if (duplicateUser) {
    return {
      success: false,
      message: "An account with this email already exists.",
    };
  }

  const newUser = {
    name: userData.name.trim(),
    email: userData.email.trim().toLowerCase(),
    password: userData.password,
    role: userData.role,
  };

  const result = await apiPost("/users", newUser);

  if (!result) {
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }

  return {
    success: true,
    user: result,
  };
}

export async function loginUser(email, password) {
  const users = await getUsers();
  const normalizedEmail = String(email).trim().toLowerCase();
  const foundUser = users.find(function (user) {
    return user.email === normalizedEmail && user.password === password;
  });

  if (!foundUser) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

  const currentUser = {
    id: foundUser.id,
    name: foundUser.name,
    email: foundUser.email,
    role: foundUser.role,
  };

  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
  }

  return {
    success: true,
    user: currentUser,
  };
}

// ── These stay exactly the same — sessionStorage, not localStorage ──
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
