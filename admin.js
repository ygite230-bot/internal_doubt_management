// admin.js
// Handles admin authentication (login/logout) and password management.
// NOTE: this is a lightweight, client-side gate for an internal tool - the
// password lives in localStorage rather than behind a real auth server.

const ADMIN_PASSWORD_KEY = "doubtPortal_adminPassword";
const ADMIN_SESSION_KEY = "doubtPortal_adminSession";
const DEFAULT_ADMIN_PASSWORD = "admin123";

function getStoredAdminPassword() {
  return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
}

function isAdminLoggedIn() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

function adminLogin(password) {
  if (password === getStoredAdminPassword()) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    return true;
  }
  return false;
}

function adminLogout() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

function changeAdminPassword(newPassword) {
  if (!newPassword || !newPassword.trim()) return false;
  localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword.trim());
  return true;
}
