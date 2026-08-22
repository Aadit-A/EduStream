const USERS_STORAGE_KEY = "edustream_users";
const CURRENT_USER_STORAGE_KEY = "currentUser";

function getUsers() {
  const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);

  if (!rawUsers) {
    return [];
  }

  try {
    const parsedUsers = JSON.parse(rawUsers);
    return Array.isArray(parsedUsers) ? parsedUsers : [];
  } catch (error) {
    console.error("Unable to read users from localStorage.", error);
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function registerUser(userData) {
  const users = getUsers();
  const duplicateUser = users.some(function (user) {
    return user.email.toLowerCase() === userData.email.toLowerCase();
  });

  if (duplicateUser) {
    return {
      success: false,
      message: "An account with this email already exists.",
    };
  }

  var uniqueNumber = Date.now();
  let randomId = Math.floor(Math.random() * 1000);
  const userId = "user-" + uniqueNumber + "-" + randomId;

  const newUser = {
    id: userId,
    name: userData.name.trim(),
    email: userData.email.trim().toLowerCase(),
    password: userData.password,
    role: userData.role,
  };

  users.push(newUser);
  saveUsers(users);

  return {
    success: true,
    user: newUser,
  };
}

function loginUser(email, password) {
  const users = getUsers();
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

  sessionStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));

  return {
    success: true,
    user: currentUser,
  };
}

function getCurrentUser() {
  const rawCurrentUser = sessionStorage.getItem(CURRENT_USER_STORAGE_KEY);

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
