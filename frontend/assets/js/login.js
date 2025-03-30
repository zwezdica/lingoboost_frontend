document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token) {
    const redirectUrl = sessionStorage.getItem("redirectUrl") || "index.html";
    window.location.href = redirectUrl;
    return;
  }

  initializeDarkMode();

  const loginContainer = document.getElementById("login");

  const themeToggle = document.createElement("div");
  themeToggle.className = "theme-switch";
  themeToggle.innerHTML = `
    <input type="checkbox" id="theme-toggle">
    <label for="theme-toggle" title="Toggle dark mode">
      ${localStorage.getItem("theme") === "dark" ? "☀️" : "🌙"}
    </label>
  `;
  document.body.appendChild(themeToggle);

  const title = document.createElement("h1");
  title.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';

  const form = document.createElement("form");
  form.id = "login-form";

  const usernameLabel = document.createElement("label");
  usernameLabel.setAttribute("for", "loginUsername");
  usernameLabel.textContent = "Username:";

  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.id = "loginUsername";
  usernameInput.placeholder = "Enter your username";
  usernameInput.required = true;

  const passwordLabel = document.createElement("label");
  passwordLabel.setAttribute("for", "loginPassword");
  passwordLabel.textContent = "Password:";

  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.id = "loginPassword";
  passwordInput.placeholder = "Enter your password";
  passwordInput.required = true;

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Login";

  const registerLink = document.createElement("p");
  registerLink.innerHTML = `Don't have an account? <a href="register.html">Register ➡</a>`;

  form.appendChild(usernameLabel);
  form.appendChild(usernameInput);
  form.appendChild(document.createElement("br"));
  form.appendChild(passwordLabel);
  form.appendChild(passwordInput);
  form.appendChild(document.createElement("br"));
  form.appendChild(submitButton);

  loginContainer.appendChild(title);
  loginContainer.appendChild(form);
  loginContainer.appendChild(registerLink);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const loginUsername = document.getElementById("loginUsername").value;
    const loginPassword = document.getElementById("loginPassword").value;

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role || "user");

        const redirectUrl =
          sessionStorage.getItem("redirectUrl") || "index.html";
        sessionStorage.removeItem("redirectUrl");
        window.location.href = redirectUrl;
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  });

  registerLink.querySelector("a").addEventListener("click", (e) => {
    e.preventDefault();
    sessionStorage.setItem("redirectAfterRegister", window.location.pathname);
    window.location.href = "register.html";
  });

  const themeCheckbox = document.getElementById("theme-toggle");
  themeCheckbox.addEventListener("change", function () {
    if (this.checked) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      document.querySelector(".theme-switch label").innerHTML = "☀️";
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
      document.querySelector(".theme-switch label").innerHTML = "🌙";
    }
  });

  if (
    localStorage.getItem("theme") === "dark" ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches &&
      !localStorage.getItem("theme"))
  ) {
    themeCheckbox.checked = true;
    document.documentElement.setAttribute("data-theme", "dark");
    document.querySelector(".theme-switch label").innerHTML = "☀️";
  }
});

function initializeDarkMode() {
  if (
    localStorage.getItem("theme") === "dark" ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches &&
      !localStorage.getItem("theme"))
  ) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
}
