async function getUsers() {
  return await apiGet("/users");
}

async function registerUser(userData) {
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

async function loginUser(email, password) {
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

  sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

  return {
    success: true,
    user: currentUser,
  };
}

// ── These stay exactly the same — sessionStorage, not localStorage ──
function getCurrentUser() {
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

function isLoggedIn() {
  return Boolean(getCurrentUser());
}

function logoutUser() {
  sessionStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function requireRole(requiredRole) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    window.location.href = "login.html";
    return false;
  }

  if (currentUser.role !== requiredRole) {
    return false;
  }

  return true;
}