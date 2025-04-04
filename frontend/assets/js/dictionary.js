const API_URL = "https://lingoboost-backend.onrender.com/api/words";
const LANGUAGES = [
  { value: "fr", text: "French" },
  { value: "es", text: "Spanish" },
  { value: "de", text: "German" },
  { value: "it", text: "Italian" },
];

let selectedLanguage = localStorage.getItem("selectedLanguage") || "fr";

document.addEventListener("DOMContentLoaded", () => {
  initializeUI();
  initializeDarkMode();
  setupEventListeners();

  window.addEventListener("storage", (event) => {
    if (event.key === "selectedLanguage") {
      selectedLanguage = localStorage.getItem("selectedLanguage") || "fr";
      const languageSelect = document.getElementById("languageSelect");
      if (languageSelect) {
        languageSelect.value = selectedLanguage;
      }
    }
  });
});

function setupEventListeners() {
  const wordInput = document.getElementById("wordInput");

  if (wordInput) {
    wordInput.addEventListener("input", handleInput);
    wordInput.addEventListener("change", handleInput);
    wordInput.addEventListener("blur", handleInput);
    wordInput.setAttribute("autocapitalize", "off");
    wordInput.setAttribute("autocorrect", "off");
    wordInput.setAttribute("spellcheck", "false");
  }

  document
    .getElementById("searchButton")
    ?.addEventListener("click", handleSearch);
  document.getElementById("backToHomeButton")?.addEventListener("click", () => {
    window.location.href = "index.html";
  });
  document
    .getElementById("theme-toggle")
    ?.addEventListener("change", toggleTheme);
  document.getElementById("languageSelect")?.addEventListener("change", (e) => {
    selectedLanguage = e.target.value;
    localStorage.setItem("selectedLanguage", selectedLanguage);
  });
}

function initializeUI() {
  const app = document.getElementById("app");

  const iconContainer = document.createElement("div");
  iconContainer.className = "icon-container";
  iconContainer.innerHTML = `
     <svg viewBox="0 0 24 24" width="24" height="24">
  <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
</svg>
  `;
  iconContainer.style.display = "none";
  app.appendChild(iconContainer);

  app.innerHTML += `
    <div class="container">
      <h1><i class="fas fa-book"></i> Dictionary</h1>
      <label for="wordInput">Enter word:</label>
      <input type="text" id="wordInput" placeholder="Enter word" 
             autocapitalize="off" autocorrect="off" spellcheck="false" />
      <label for="languageSelect">Select language:</label>
      <select id="languageSelect">
        ${LANGUAGES.map(
          (lang) =>
            `<option value="${lang.value}" ${
              lang.value === selectedLanguage ? "selected" : ""
            }>${lang.text}</option>`
        ).join("")}
      </select>
      <button id="searchButton">Search</button>
      <div id="result"></div>
      <button id="backToHomeButton" class="back-home-btn">⬅ Back to Home</button>
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

function handleInput(e) {
  const input = e.target;
  const cursorPos = input.selectionStart;
  input.value = input.value.toLocaleLowerCase();

  setTimeout(() => {
    input.setSelectionRange(cursorPos, cursorPos);
  }, 0);
}

async function handleSearch() {
  const wordInput = document.getElementById("wordInput");
  const word = wordInput.value.trim().toLowerCase();
  const language = document.getElementById("languageSelect").value;

  if (!word) {
    displayError("Please enter a word to search");
    wordInput.focus();
    return;
  }

  try {
    showLoading(true);
    const response = await fetch(
      `${API_URL}/search?word=${encodeURIComponent(word)}&language=${language}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Word not found");
    }

    const data = await response.json();
    displayResult(data, language);
  } catch (error) {
    console.error("Search error:", error);
    displayError(error.message || "Something went wrong. Please try again.");
  } finally {
    showLoading(false);
  }
}

function displayResult(data, language) {
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = `
    <div class="result-card">
      <h3>${data.word || "Unknown word"}</h3>
      <p class="translation"><strong>Translation:</strong> ${
        data.translation || "Not available"
      }</p>
      ${
        data.pronunciation
          ? `<p class="pronunciation"><strong>Pronunciation:</strong> ${data.pronunciation}</p>`
          : ""
      }
      ${
        data.examples
          ? `<div class="examples"><strong>Examples:</strong> ${formatExamples(
              data.examples
            )}</div>`
          : ""
      }
    </div>
  `;
}

function formatExamples(examples) {
  if (Array.isArray(examples)) {
    return `<ul>${examples.map((ex) => `<li>${ex}</li>`).join("")}</ul>`;
  }
  return examples;
}

function displayError(message) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      ${message}
    </div>
  `;
}

function showLoading(show) {
  const searchButton = document.getElementById("searchButton");
  if (searchButton) {
    searchButton.disabled = show;
    searchButton.innerHTML = show
      ? '<i class="fas fa-spinner fa-spin"></i> Searching...'
      : "Search";
  }
}

function initializeDarkMode() {
  const themeToggle = document.getElementById("theme-toggle");
  const themeLabel = document.querySelector(".theme-switch label");

  if (!themeToggle || !themeLabel) return;

  const isDarkMode =
    localStorage.getItem("theme") === "dark" ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches &&
      !localStorage.getItem("theme"));

  themeToggle.checked = isDarkMode;
  themeLabel.innerHTML = isDarkMode ? "☀️" : "🌙";

  if (isDarkMode) {
    document.documentElement.setAttribute("data-theme", "dark");
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
