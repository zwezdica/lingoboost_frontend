const API_URL = "http://localhost:5000/api/words";
const LANGUAGES = [
  { value: "fr", text: "French" },
  { value: "es", text: "Spanish" },
  { value: "de", text: "German" },
  { value: "it", text: "Italian" },
];

document.addEventListener("DOMContentLoaded", () => {
  initializeUI();
  initializeDarkMode();
  setupEventListeners();
});

function setupEventListeners() {
  document
    .getElementById("searchButton")
    ?.addEventListener("click", handleSearch);
  document.getElementById("backToHomeButton")?.addEventListener("click", () => {
    window.location.href = "index.html";
  });
  document
    .getElementById("theme-toggle")
    ?.addEventListener("change", toggleTheme);
}

function initializeUI() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="container">
      <h1><i class="fas fa-book"></i> Dictionary</h1>
      <label for="wordInput">Enter word:</label>
      <input type="text" id="wordInput" placeholder="Enter word" />
      <label for="languageSelect">Select language:</label>
      <select id="languageSelect">
        ${LANGUAGES.map(
          (lang) => `<option value="${lang.value}">${lang.text}</option>`
        ).join("")}
      </select>
      <button id="searchButton">Search</button>
      <div id="result"></div>
      <button id="backToHomeButton" style="display: none">⬅ Back to Home</button>
    </div>
  `;

  const themeToggle = document.createElement("div");
  themeToggle.className = "theme-switch";
  themeToggle.innerHTML = `
    <input type="checkbox" id="theme-toggle">
    <label for="theme-toggle" title="Toggle dark mode">
      ${localStorage.getItem("theme") === "dark" ? "☀️" : "🌙"}
    </label>
  `;
  document.body.appendChild(themeToggle);
}
async function handleSearch() {
  const word = document.getElementById("wordInput").value.trim();
  const language = document.getElementById("languageSelect").value;

  if (!word) {
    displayError("Please enter a word to search");
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/search?word=${word}&language=${language}`
    );
    const data = await response.json();

    if (response.ok) {
      displayResult(data, language);
    } else {
      displayError(data.message || "Word not found");
    }
  } catch (error) {
    console.error("Search error:", error);
    displayError("Something went wrong. Please try again.");
  }
}

function displayResult(data, language) {
  const resultDiv = document.getElementById("result");
  const backToHomeButton = document.getElementById("backToHomeButton");

  resultDiv.innerHTML = `
    <div class="result-card">
      <p class="translation">${
        data.translation || "Translation not available"
      }</p>
    </div>
  `;

  backToHomeButton.style.display = "block";
}

function displayError(message) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `<div class="error-message">${message}</div>`;
}

function initializeDarkMode() {
  const theme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (theme === "dark" || (!theme && prefersDark)) {
    document.documentElement.setAttribute("data-theme", "dark");
    document.getElementById("theme-toggle").checked = true;
    document.querySelector(".theme-switch label").innerHTML = "☀️";
  }
}

const themeToggle = document.createElement("div");
themeToggle.className = "theme-switch";
themeToggle.innerHTML = `
    <input type="checkbox" id="theme-toggle">
    <label for="theme-toggle" title="Toggle dark mode">
      ${localStorage.getItem("theme") === "dark" ? "☀️" : "🌙"}
    </label>
  `;
document.body.appendChild(themeToggle);

function initializeDarkMode() {
  const themeToggle = document.getElementById("theme-toggle");
  const themeLabel = document.querySelector(".theme-switch label");

  // Only proceed if elements exist
  if (!themeToggle || !themeLabel) return;

  const theme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (theme === "dark" || (!theme && prefersDark)) {
    themeToggle.checked = true;
    document.documentElement.setAttribute("data-theme", "dark");
    themeLabel.innerHTML = "☀️";
  }
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
