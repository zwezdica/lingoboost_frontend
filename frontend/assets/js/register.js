document.addEventListener("DOMContentLoaded", () => {
  initializeDarkMode();

  const themeToggle = document.createElement("div");
  themeToggle.className = "theme-switch";
  themeToggle.innerHTML = `
    <input type="checkbox" id="theme-toggle">
    <label for="theme-toggle" title="Toggle dark mode">
      ${localStorage.getItem("theme") === "dark" ? "☀️" : "🌙"}
    </label>
  `;
  document.body.appendChild(themeToggle);

  const registerContainer = document.getElementById("register");
  registerContainer.className = "container";

  const title = document.createElement("h1");
  title.innerHTML = '<i class="fas fa-user-plus"></i> Register';

  const form = document.createElement("form");
  form.id = "register-form";

  const usernameLabel = document.createElement("label");
  usernameLabel.setAttribute("for", "reg-username");
  usernameLabel.textContent = "Username:";

  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.id = "reg-username";
  usernameInput.placeholder = "Choose a username";
  usernameInput.required = true;

  const emailLabel = document.createElement("label");
  emailLabel.setAttribute("for", "reg-email");
  emailLabel.textContent = "Email:";

  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.id = "reg-email";
  emailInput.placeholder = "Enter your email";
  emailInput.required = true;

  const passwordLabel = document.createElement("label");
  passwordLabel.setAttribute("for", "reg-password");
  passwordLabel.textContent = "Password:";

  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.id = "reg-password";
  passwordInput.placeholder = "Choose a password";
  passwordInput.required = true;

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Register";

  const loginLink = document.createElement("p");
  loginLink.innerHTML = `Already have an account? <a class= "loginLink" href="login.html">Login ➡</a>`;

  form.appendChild(usernameLabel);
  form.appendChild(usernameInput);
  form.appendChild(document.createElement("br"));
  form.appendChild(emailLabel);
  form.appendChild(emailInput);
  form.appendChild(document.createElement("br"));
  form.appendChild(passwordLabel);
  form.appendChild(passwordInput);
  form.appendChild(document.createElement("br"));
  form.appendChild(submitButton);

  registerContainer.appendChild(title);
  registerContainer.appendChild(form);
  registerContainer.appendChild(loginLink);

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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("reg-username").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;

    console.log("Slanje zahteva:", { username, email, password });

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const text = await res.text();
      console.log("Raw response:", text);

      const data = text ? JSON.parse(text) : {};

      console.log("Parsed response:", data);

      if (res.ok) {
        alert("Registracija uspešna!");
        window.location.href = "login.html";
      } else {
        alert(data.message || "Register failed.");
      }
    } catch (error) {
      console.error("Greška:", error);
      alert("An error occurred. Please try again.");
    }
  });
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
