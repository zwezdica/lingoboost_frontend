const API_URL = "https://lingoboost-backend.onrender.com/api/bingo";
const DIFFICULTIES = [
  { value: "easy", text: "Easy" },
  { value: "medium", text: "Medium" },
  { value: "hard", text: "Hard" },
];
const LANGUAGES = [
  { value: "fr", text: "Français" },
  { value: "es", text: "Español" },
  { value: "de", text: "Deutsch" },
  { value: "it", text: "Italian" },
];

let score = 0;
let currentWord = null;
let selectedLanguage = localStorage.getItem("selectedLanguage") || "fr";

document.addEventListener("DOMContentLoaded", () => {
  initializeUI();
  initializeDarkMode();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById("start-button")?.addEventListener("click", startGame);
  document.getElementById("back-to-home")?.addEventListener("click", () => {
    window.location.href = "index.html";
  });
  document.getElementById("close-modal")?.addEventListener("click", () => {
    document.getElementById("modal").style.display = "none";
  });
  document
    .getElementById("close-translation-modal")
    ?.addEventListener("click", () => {
      document.getElementById("translation-modal").style.display = "none";
    });

  document
    .getElementById("translation-input")
    ?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleTranslationSubmit();
      }
    });

  document
    .getElementById("submit-translation")
    ?.addEventListener("click", handleTranslationSubmit);

  document
    .getElementById("theme-toggle")
    ?.addEventListener("change", toggleTheme);

  document
    .getElementById("language-selector")
    ?.addEventListener("change", (e) => {
      selectedLanguage = e.target.value;
      localStorage.setItem("selectedLanguage", selectedLanguage);
    });

  window.addEventListener("click", (event) => {
    if (event.target === document.getElementById("modal")) {
      document.getElementById("modal").style.display = "none";
    }
    if (event.target === document.getElementById("translation-modal")) {
      document.getElementById("translation-modal").style.display = "none";
    }
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

  app.appendChild(createThemeToggle());

  const title = document.createElement("h1");
  title.innerHTML = '<i class="fas fa-gamepad"></i> Bingo Game';
  app.appendChild(title);

  const selectorContainer = document.createElement("div");
  selectorContainer.className = "selector-container";

  selectorContainer.appendChild(
    createSelector("level-selector", "Choose difficulty:", DIFFICULTIES)
  );

  const languageSelector = createSelector(
    "language-selector",
    "Choose language:",
    LANGUAGES
  );

  languageSelector.querySelector("select").value = selectedLanguage;
  selectorContainer.appendChild(languageSelector);

  const startButton = document.createElement("button");
  startButton.id = "start-button";
  startButton.textContent = "Start Game";
  selectorContainer.appendChild(startButton);

  app.appendChild(selectorContainer);

  const backToHomeButton = document.createElement("button");
  backToHomeButton.id = "back-to-home";
  backToHomeButton.textContent = "⬅ Back to Home";
  app.appendChild(backToHomeButton);

  const scoreDisplay = document.createElement("div");
  scoreDisplay.id = "score";
  scoreDisplay.textContent = "Score: 0";
  app.appendChild(scoreDisplay);

  const bingoTable = document.createElement("table");
  bingoTable.id = "bingo-table";
  app.appendChild(bingoTable);

  app.appendChild(createModal("modal", "modal-title", "modal-message"));
  app.appendChild(createTranslationModal());
}

function createThemeToggle() {
  const themeToggle = document.createElement("div");
  themeToggle.className = "theme-switch";
  themeToggle.innerHTML = `
    <input type="checkbox" id="theme-toggle">
    <label for="theme-toggle" title="Toggle dark mode">
      ${localStorage.getItem("theme") === "dark" ? "☀️" : "🌙"}
    </label>
  `;
  return themeToggle;
}

function createSelector(id, labelText, options) {
  const container = document.createElement("div");
  container.className = "selector-item";

  const label = document.createElement("label");
  label.setAttribute("for", id);
  label.textContent = labelText;
  container.appendChild(label);

  const selector = document.createElement("select");
  selector.id = id;

  options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.textContent = option.text;
    selector.appendChild(optionElement);
  });

  container.appendChild(selector);
  return container;
}

function createModal(id, titleId, messageId) {
  const modal = document.createElement("div");
  modal.id = id;
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <span id="close-${id}">&times;</span>
      <h2 id="${titleId}"></h2>
      <p id="${messageId}"></p>
    </div>
  `;
  return modal;
}

function createTranslationModal() {
  const modal = document.createElement("div");
  modal.id = "translation-modal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <span id="close-translation-modal">&times;</span>
      <h2 id="translation-modal-title"></h2>
      <input type="text" id="translation-input" placeholder="Enter translation" />
      <button id="submit-translation">Submit</button>
    </div>
  `;
  return modal;
}

async function startGame() {
  const level = document.getElementById("level-selector").value;
  const language = document.getElementById("language-selector").value;

  try {
    const response = await fetch(
      `${API_URL}/words?level=${level}&language=${language}`
    );
    if (!response.ok) throw new Error("Error fetching words");

    const { words } = await response.json();
    generateBingoTable(words);
  } catch (error) {
    console.error("An error occurred:", error);
    showModal(
      "Error",
      "An error occurred while loading words. Please try again."
    );
  }
}

function generateBingoTable(words) {
  const bingoTable = document.getElementById("bingo-table");
  bingoTable.innerHTML = "";
  const size = Math.sqrt(words.length);

  for (let i = 0; i < size; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < size; j++) {
      const cell = document.createElement("td");
      const word = words[i * size + j];
      cell.textContent = word.word;
      cell.dataset.wordId = word._id;
      cell.addEventListener("click", () => showTranslationModal(word));
      row.appendChild(cell);
    }
    bingoTable.appendChild(row);
  }
}

function showModal(title, message) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-message").textContent = message;
  document.getElementById("modal").style.display = "block";
}

function showTranslationModal(word) {
  currentWord = word;
  const language = document.getElementById("language-selector");
  document.getElementById(
    "translation-modal-title"
  ).textContent = `Translate the word "${word.word}" to ${
    language.options[language.selectedIndex].text
  }:`;

  document.getElementById("translation-input").value = "";
  document.getElementById("translation-modal").style.display = "block";
}

async function handleTranslationSubmit() {
  const translationInput = document.getElementById("translation-input");
  const userTranslation = translationInput.value.trim();

  if (!userTranslation) {
    showModal("Error", "Please enter a translation");
    return;
  }

  document.getElementById("translation-modal").style.display = "none";
  await checkTranslation(currentWord, userTranslation.toLowerCase());
}

async function checkTranslation(word, userTranslation) {
  const selectedLanguage = document.getElementById("language-selector").value;

  try {
    const response = await fetch(`${API_URL}/check-translation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wordId: word._id,
        language: selectedLanguage,
        userTranslation: userTranslation.toLowerCase(),
      }),
    });

    if (!response.ok) throw new Error("Error checking translation");

    const { isCorrect, correctTranslation } = await response.json();
    if (isCorrect) {
      showModal(
        "Correct!",
        `The correct translation is: ${correctTranslation}`
      );
      score += 10;
      document.getElementById("score").textContent = `Score: ${score}`;
    } else {
      showModal(
        "Incorrect!",
        `The correct translation is: ${correctTranslation}`
      );
    }
  } catch (error) {
    console.error("An error occurred:", error);
    showModal(
      "Error",
      "An error occurred while checking the translation. Please try again."
    );
  }
}

function initializeDarkMode() {
  const themeToggle = document.getElementById("theme-toggle");
  const themeLabel = document.querySelector(".theme-switch label");

  if (!themeToggle || !themeLabel) return;

  const isDarkMode = shouldUseDarkMode();
  themeToggle.checked = isDarkMode;
  themeLabel.innerHTML = isDarkMode ? "☀️" : "🌙";

  if (isDarkMode) {
    document.documentElement.setAttribute("data-theme", "dark");
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
