const dashboard = document.getElementById("protectedDashboard");
const logoutButton = document.getElementById("logoutButton");
const welcomeMessage = document.getElementById("welcomeMessage");
const roleMessage = document.getElementById("roleMessage");

if (dashboard && requireLogin()) {
  const currentUser = getCurrentUser();
  welcomeMessage.textContent = "Welcome, " + currentUser.name;
  roleMessage.textContent = "Role: " + currentUser.role;
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    logoutUser();
  });
}
