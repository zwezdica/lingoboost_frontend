const API_URL = "https://lingoboost-backend.onrender.com/api/auth";
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  needsUppercase: true,
  needsNumber: true,
  needsSpecialChar: true,
};
const SPECIAL_CHARS = "!@#$%^&*()_+-=[]{};':\"\\|,.<>/?".split("");
const SPECIAL_CHARS_UI = SPECIAL_CHARS.join("").replace(/[\\]/g, "\\\\");

const escapedSpecialChars = SPECIAL_CHARS.map((char) => {
  if (/[-\/\\^$*+?.()|[\]{}]/.test(char)) {
    return `\\${char}`;
  }
  return char;
}).join("");

const elements = {
  registerContainer: document.getElementById("register"),
  themeToggle: null,
  themeCheckbox: null,
  registerForm: null,
  usernameInput: null,
  emailInput: null,
  passwordInput: null,
  registerButton: null,
};

document.addEventListener("DOMContentLoaded", () => {
  setupRegisterUI();
  initializeDarkMode();
  setupEventListeners();
});

function setupEventListeners() {
  if (elements.themeCheckbox) {
    elements.themeCheckbox.addEventListener("change", handleThemeToggle);
  }

  if (elements.registerForm) {
    elements.registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleRegisterSubmit(e);
    });
  }

  if (elements.passwordInput) {
    elements.passwordInput.addEventListener("input", validatePassword);
  }
}

function setupRegisterUI() {
  if (!elements.registerContainer) return;

  elements.themeToggle = createThemeToggle();
  document.body.appendChild(elements.themeToggle);
  elements.themeCheckbox = document.getElementById("theme-toggle");

  elements.registerContainer.className = "container";
  elements.registerContainer.innerHTML = `
    <h1><i class="fas fa-user-plus"></i> Register</h1>
    <form id="register-form">
      <label for="reg-username">Username:</label>
      <input type="text" id="reg-username" placeholder="Choose a username" required minlength="3">
      
      <label for="reg-email">Email:</label>
      <input type="email" id="reg-email" placeholder="Enter your email" required>
      
      <label for="reg-password">Password:</label>
      <input type="password" id="reg-password" placeholder="Choose a password" required>
      
      <div id="password-strength">
        <div class="requirement" id="req-length">✓ At least ${PASSWORD_REQUIREMENTS.minLength} characters</div>
        <div class="requirement" id="req-uppercase">✓ Uppercase letter</div>
        <div class="requirement" id="req-number">✓ Number</div>
        <div class="requirement" id="req-special">✓ Special character (${SPECIAL_CHARS_UI})</div>
      </div>
      
      <button type="submit" id="register-button" disabled>Register</button>
    </form>
    <p>Already have an account? <a class="loginLink" href="login.html">Login ➡</a></p>
  `;

  elements.registerForm = document.getElementById("register-form");
  elements.usernameInput = document.getElementById("reg-username");
  elements.emailInput = document.getElementById("reg-email");
  elements.passwordInput = document.getElementById("reg-password");
  elements.registerButton = document.getElementById("register-button");
}

function validatePassword() {
  const password = elements.passwordInput.value;
  const requirements = checkPasswordRequirements(password);
  updatePasswordUI(requirements);
  updateSubmitButton(requirements);
}

function checkPasswordRequirements(password) {
  return {
    length: password.length >= PASSWORD_REQUIREMENTS.minLength,
    uppercase: PASSWORD_REQUIREMENTS.needsUppercase
      ? /[A-Z]/.test(password)
      : true,
    number: PASSWORD_REQUIREMENTS.needsNumber ? /\d/.test(password) : true,
    special: PASSWORD_REQUIREMENTS.needsSpecialChar
      ? new RegExp(`[${escapedSpecialChars}]`).test(password)
      : true,
  };
}

function updatePasswordUI(requirements) {
  for (const [key, met] of Object.entries(requirements)) {
    const element = document.getElementById(`req-${key}`);
    if (element) {
      element.classList.toggle("met", met);
    }
  }
}

function updateSubmitButton(requirements) {
  if (elements.registerButton) {
    elements.registerButton.disabled =
      !Object.values(requirements).every(Boolean);
  }
}

function validateForm(username, email, password) {
  if (username.length < 3) {
    alert("Username must be at least 3 characters long");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address");
    return false;
  }

  const passwordRegex = new RegExp(
    `^(?=.*[A-Z])(?=.*\\d)(?=.*[${escapedSpecialChars}]).{${PASSWORD_REQUIREMENTS.minLength},}$`
  );

  if (!passwordRegex.test(password)) {
    alert(
      `Password must contain:\n- At least ${PASSWORD_REQUIREMENTS.minLength} characters\n- At least one uppercase letter\n- At least one number\n- At least one special character (${SPECIAL_CHARS_UI})`
    );
    return false;
  }

  return true;
}

async function handleRegisterSubmit(e) {
  e.preventDefault();

  const username = elements.usernameInput.value.trim();
  const email = elements.emailInput.value.trim();
  const password = elements.passwordInput.value;

  if (!validateForm(username, email, password)) return;

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      showRegistrationSuccess();
    } else {
      showRegistrationError(
        data.message || "Registration failed. Please try again."
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    showRegistrationError("An error occurred. Please try again.");
  }
}

function showRegistrationSuccess() {
  alert("Registration successful! You can now login.");
  window.location.href = "login.html";
}

function showRegistrationError(message) {
  alert(message);
  elements.passwordInput.value = "";
  validatePassword();
}

function createThemeToggle() {
  const container = document.createElement("div");
  container.className = "theme-switch";
  container.innerHTML = `
    <input type="checkbox" id="theme-toggle">
    <label for="theme-toggle" title="Toggle dark mode">
      ${localStorage.getItem("theme") === "dark" ? "☀️" : "🌙"}
    </label>
  `;
  return container;
}

function initializeDarkMode() {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const isDarkMode = savedTheme ? savedTheme === "dark" : systemPrefersDark;

  document.documentElement.setAttribute(
    "data-theme",
    isDarkMode ? "dark" : "light"
  );

  if (elements.themeCheckbox) {
    elements.themeCheckbox.checked = isDarkMode;
  }
}

function handleThemeToggle() {
  const isDarkMode = elements.themeCheckbox.checked;
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  document.documentElement.setAttribute(
    "data-theme",
    isDarkMode ? "dark" : "light"
  );
}
