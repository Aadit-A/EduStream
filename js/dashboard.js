const sessionStatusText = document.getElementById("sessionStatusText");

if (sessionStatusText) {
  const currentUser = getCurrentUser();

  if (currentUser) {
    sessionStatusText.textContent =
      "User: " + currentUser.name + " | Role: " + currentUser.role + " | Logged in: Yes";
  } else {
    sessionStatusText.textContent = "User: Guest | Role: N/A | Logged in: No";
  }
}
