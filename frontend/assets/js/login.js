const API_URL = "http://localhost:5000/api/auth";

document.addEventListener("DOMContentLoaded", () => {
  checkAuthAndRedirect();
  initializeUI(); //
  setupEventListeners();
  initializeDarkMode();
});

function setupEventListeners() {
  document
    .getElementById("login-form")
    ?.addEventListener("submit", handleLogin);
  document
    .getElementById("register-link")
    ?.addEventListener("click", handleRegisterClick);
  document
    .getElementById("theme-toggle")
    ?.addEventListener("change", toggleTheme);
}

function checkAuthAndRedirect() {
  const token = localStorage.getItem("token");
  if (token) {
    const redirectUrl = sessionStorage.getItem("redirectUrl") || "index.html";
    window.location.href = redirectUrl;
  }
}

async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      storeUserData(data);
      redirectAfterLogin();
    } else {
      showError(data.message || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    showError("An error occurred. Please try again.");
  }
}

function storeUserData(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("username", data.username);
  localStorage.setItem("role", data.role || "user");
}

function redirectAfterLogin() {
  const redirectUrl = sessionStorage.getItem("redirectUrl") || "index.html";
  sessionStorage.removeItem("redirectUrl");
  window.location.href = redirectUrl;
}

function handleRegisterClick(e) {
  e.preventDefault();
  sessionStorage.setItem("redirectAfterRegister", window.location.pathname);
  window.location.href = "register.html";
}

function initializeUI() {
  createLoginForm();
  createThemeToggle();
}

function createThemeToggle() {
  const themeToggleContainer = document.createElement("div");
  themeToggleContainer.className = "theme-switch";
  themeToggleContainer.innerHTML = `
    <input type="checkbox" id="theme-toggle">
    <label for="theme-toggle" title="Toggle dark mode">
      ${localStorage.getItem("theme") === "dark" ? "☀️" : "🌙"}
    </label>
  `;
  document.body.insertBefore(themeToggleContainer, document.body.firstChild);
}

function createLoginForm() {
  const loginContainer = document.getElementById("login") || document.body;

  loginContainer.innerHTML = `
    <h1><i class="fas fa-sign-in-alt"></i> Login</h1>
    <form id="login-form">
      <label for="loginUsername">Username:</label>
      <input type="text" id="loginUsername" placeholder="Enter your username" required>
      <br>
      <label for="loginPassword">Password:</label>
      <input type="password" id="loginPassword" placeholder="Enter your password" required>
      <br>
      <button type="submit">Login</button>
    </form>
    <p>Don't have an account? <a id="register-link" href="register.html">Register ➡</a></p>
  `;
}

function initializeDarkMode() {
  const themeToggle = document.getElementById("theme-toggle");
  const themeLabel = document.querySelector(".theme-switch label");

  if (!themeToggle || !themeLabel) return;

  if (shouldUseDarkMode()) {
    themeToggle.checked = true;
    document.documentElement.setAttribute("data-theme", "dark");
    themeLabel.innerHTML = "☀️";
  }
}

function shouldUseDarkMode() {
  return (
    localStorage.getItem("theme") === "dark" ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches &&
      !localStorage.getItem("theme"))
  );
}

function toggleTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  const themeLabel = document.querySelector(".theme-switch label");

  if (!themeToggle || !themeLabel) return;

  if (themeToggle.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    themeLabel.innerHTML = "☀️";
  } else {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
    themeLabel.innerHTML = "🌙";
  }
}

function showError(message) {
  const errorElement =
    document.getElementById("error-message") || createErrorElement();
  errorElement.textContent = message;
  errorElement.style.display = "block";
  setTimeout(() => {
    errorElement.style.display = "none";
  }, 5000);
}

function createErrorElement() {
  const errorElement = document.createElement("div");
  errorElement.id = "error-message";
  errorElement.className = "error-message";
  errorElement.style.display = "none";
  document.body.appendChild(errorElement);
  return errorElement;
}
