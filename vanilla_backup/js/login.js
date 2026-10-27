const loginForm = document.getElementById("loginForm");
const loginSuccess = document.getElementById("loginSuccess");
const loginUserDetails = document.getElementById("loginUserDetails");

const loginFieldMap = {
  email: document.getElementById("loginEmail"),
  password: document.getElementById("loginPassword"),
};

const loginErrorMap = {
  email: document.getElementById("loginEmailError"),
  password: document.getElementById("loginPasswordError"),
};

function setLoginError(fieldName, message) {
  const input = loginFieldMap[fieldName];
  const errorElement = loginErrorMap[fieldName];

  if (!input || !errorElement) return;

  if (message) {
    input.setAttribute("aria-invalid", "true");
    errorElement.textContent = message;
    errorElement.classList.add("has-error");
  } else {
    input.removeAttribute("aria-invalid");
    errorElement.textContent = "";
    errorElement.classList.remove("has-error");
  }
}

function clearLoginSuccess() {
  loginSuccess.classList.add("hidden");
  loginUserDetails.textContent = "";
}

function validateLoginForm(email, password) {
  let isValid = true;

  if (!email.trim()) {
    setLoginError("email", "Email is required.");
    isValid = false;
  } else {
    setLoginError("email", "");
  }

  if (!password) {
    setLoginError("password", "Password is required.");
    isValid = false;
  } else {
    setLoginError("password", "");
  }

  return isValid;
}

if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    clearLoginSuccess();

    const email = loginFieldMap.email.value;
    const password = loginFieldMap.password.value;

    if (!validateLoginForm(email, password)) return;

    const result = await loginUser(email, password);

    if (!result.success) {
      setLoginError("email", result.message);
      setLoginError("password", "");
      return;
    }

    loginForm.reset();

    if (result.user.role === "instructor") {
      window.location.href = "instructor.html";
      return;
    }

    if (result.user.role === "student") {
      window.location.href = "courses.html";
      return;
    }

    loginSuccess.classList.remove("hidden");
    loginUserDetails.textContent =
      "Welcome, " + result.user.name + " (" + result.user.role + ")";
  });
}