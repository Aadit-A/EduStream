const registerForm = document.getElementById("registerForm");
const successMessage = document.getElementById("successMessage");

const fieldMap = {
  name: document.getElementById("name"),
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  role: document.getElementById("role"),
};

const errorMap = {
  name: document.getElementById("nameError"),
  email: document.getElementById("emailError"),
  password: document.getElementById("passwordError"),
  role: document.getElementById("roleError"),
};

function setError(fieldName, message) {
  const input = fieldMap[fieldName];
  const errorElement = errorMap[fieldName];

  if (!input || !errorElement) {
    return;
  }

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

function validateEmailFormat(emailValue) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(emailValue);
}

function validateRegistrationForm(formData) {
  let isValid = true;

  if (!formData.name.trim()) {
    setError("name", "Name is required.");
    isValid = false;
  } else {
    setError("name", "");
  }

  if (!formData.email.trim()) {
    setError("email", "Email is required.");
    isValid = false;
  } else if (!validateEmailFormat(formData.email.trim())) {
    setError("email", "Please enter a valid email.");
    isValid = false;
  } else {
    setError("email", "");
  }

  if (!formData.password) {
    setError("password", "Password is required.");
    isValid = false;
  } else {
    setError("password", "");
  }

  if (!formData.role) {
    setError("role", "Please select a role.");
    isValid = false;
  } else {
    setError("role", "");
  }

  return isValid;
}

function clearSuccessMessage() {
  successMessage.classList.add("hidden");
  successMessage.querySelector("p").textContent = "Registration successful.";
}

if (registerForm) {
  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    clearSuccessMessage();

    const formData = {
      name: fieldMap.name.value,
      email: fieldMap.email.value,
      password: fieldMap.password.value,
      role: fieldMap.role.value,
    };

    const isValid = validateRegistrationForm(formData);

    if (!isValid) {
      return;
    }

    const result = registerUser(formData);

    if (!result.success) {
      setError("email", result.message);
      return;
    }

    registerForm.reset();
    successMessage.classList.remove("hidden");
    successMessage.querySelector("p").textContent =
      "Registration successful for " + result.user.role + ".";
  });
}
