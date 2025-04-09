const API_URL = "https://lingoboost-backend.onrender.com/api/guessWords";
const LANGUAGES = [
  { value: "fr", text: "Français" },
  { value: "es", text: "Español" },
  { value: "de", text: "Deutsch" },
  { value: "it", text: "Italian" },
];

let userToken = localStorage.getItem("token");
let score = 0;
let selectedLanguage = localStorage.getItem("selectedLanguage") || "fr";
let currentWord = "";
let currentWordIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
  initializeUI();
  initializeDarkMode();
  setupEventListeners();
  fetchKeyboard(selectedLanguage);
});

function setupEventListeners() {
  document
    .getElementById("language-selector")
    ?.addEventListener("change", (e) => {
      selectedLanguage = e.target.value;
      localStorage.setItem("selectedLanguage", selectedLanguage);
      currentWordIndex = 0;
      fetchKeyboard(selectedLanguage);
    });

  document.getElementById("start-game")?.addEventListener("click", startGame);
  document
    .getElementById("guess-button")
    ?.addEventListener("click", handleGuess);
  document.getElementById("back-home-button")?.addEventListener("click", () => {
    window.location.href = "index.html";
  });
  document
    .getElementById("next-button")
    ?.addEventListener("click", loadNextWord);
  document
    .getElementById("previous-button")
    ?.addEventListener("click", loadPreviousWord);

  document.getElementById("letterInput")?.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 1);
  });

  document
    .getElementById("theme-toggle")
    ?.addEventListener("change", toggleTheme);
}

function checkAuthStatus() {
  if (!userToken) {
    alert("You must be logged in to play.");
    window.location.href = "login.html";
  }
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
    <div class="theme-switch">
      <input type="checkbox" id="theme-toggle">
      <label for="theme-toggle" title="Toggle dark mode">
        ${localStorage.getItem("theme") === "dark" ? "☀️" : "🌙"}
      </label>
    </div>
    <h1><i class="fas fa-keyboard"></i> Guess Word</h1>
    <div id="language-container">
      <label for="language-selector">Choose a language:</label>
      <select id="language-selector">
        ${LANGUAGES.map(
          (lang) =>
            `<option value="${lang.value}" ${
              lang.value === selectedLanguage ? "selected" : ""
            }>${lang.text}</option>`
        ).join("")}
      </select>
    </div>

    <div id="word-container">
      <p class="hidden-word">_ _ _ _</p>
    </div>

    <button id="start-game">Start Game</button>

    <p id="messageBox"></p>
    <p id="scoreboard">Score: 0</p>

    <input type="text" id="letterInput" maxlength="1" placeholder="Enter a letter">
    <button id="guess-button">Guess</button>

    <div id="meaningBox"></div>

    <button id="back-home-button">⬅ Back to home</button>
    <button id="previous-button">Previous Word</button>
    <button id="next-button">Next Word</button>
    <div id="keyboard-container"></div>
  `;
}

async function fetchKeyboard(language) {
  try {
    const response = await fetch(
      `https://lingoboost-backend.onrender.com/api/keyboards/${language}`
    );
    const data = await response.json();

    if (response.ok && data.keyboard) {
      displayKeyboard(data.keyboard);
    } else {
      throw new Error(data.message || "Failed to fetch keyboard");
    }
  } catch (error) {
    console.error("Keyboard error:", error);
    document.getElementById("messageBox").textContent =
      "Error loading keyboard layout";
  }
}

function displayKeyboard(keys) {
  const keyboardContainer = document.getElementById("keyboard-container");
  keyboardContainer.innerHTML = "";

  keys.forEach((key) => {
    const keyButton = document.createElement("button");
    keyButton.className = "keyboard-key";
    keyButton.textContent = key;
    keyButton.addEventListener("click", () => {
      document.getElementById("letterInput").value = key;
      handleGuess();
    });
    keyboardContainer.appendChild(keyButton);
  });
}

async function startGame() {
  try {
    const response = await fetch(
      `${API_URL}/start?lang=${selectedLanguage}&index=${currentWordIndex}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );

    const data = await response.json();
    if (response.ok) {
      currentWord = data.word || data.hiddenWord;
      updateGameUI(data);
      showMessage(`Game started! Language: ${selectedLanguage.toUpperCase()}`);
    } else {
      showMessage(data.message || "Failed to start game");
    }
  } catch (error) {
    console.error("Start game error:", error);
    showMessage("Error starting game. Please try again.");
  }
}

async function handleGuess() {
  const letter = document.getElementById("letterInput").value.toLowerCase();
  if (!letter) return;

  try {
    const response = await fetch(`${API_URL}/guess/${letter}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        letter: letter,
        language: selectedLanguage,
        currentWordIndex: currentWordIndex,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      updateGameUI(data);
      handleGuessResult(data);
    } else {
      showMessage(data.message || "Error processing guess");
    }
  } catch (error) {
    console.error("Guess error:", error);
    showMessage("Error processing guess. Please try again.");
  } finally {
    document.getElementById("letterInput").value = "";
  }
}

function updateGameUI(data) {
  if (data.hiddenWord) {
    document.querySelector(".hidden-word").textContent = data.hiddenWord
      .split("")
      .join(" ");
  }
  if (data.meaning) {
    document.getElementById(
      "meaningBox"
    ).textContent = `Meaning: ${data.meaning}`;
  }
}

function handleGuessResult(data) {
  if (data.success) {
    if (data.hiddenWord && !data.hiddenWord.includes("_")) {
      score++;
      updateScoreboard();
      showMessage("Congratulations! You guessed the word!");
    } else {
      showMessage("Correct guess!");
    }
  } else {
    showMessage("Wrong guess, try again.");
  }
}

async function loadNextWord() {
  currentWordIndex++;
  await startGame();
}

async function loadPreviousWord() {
  if (currentWordIndex > 0) {
    currentWordIndex--;
    await startGame();
  }
}

function updateScoreboard() {
  document.getElementById("scoreboard").textContent = `Score: ${score}`;
}

function showMessage(message) {
  const messageBox = document.getElementById("messageBox");
  messageBox.textContent = message;
  setTimeout(() => {
    messageBox.textContent = "";
  }, 3000);
}

function initializeDarkMode() {
  const themeToggle = document.getElementById("theme-toggle");
  const themeLabel = document.querySelector(".theme-switch label");

  if (!themeToggle || !themeLabel) return;

  const isDarkMode =
    localStorage.getItem("theme") === "dark" ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches &&
      !localStorage.getItem("theme"));

  if (isDarkMode) {
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
