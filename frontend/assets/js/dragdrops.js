const API_URL = "https://lingoboost-backend.onrender.com/api/dragdrops";
const LANGUAGES = [
  { value: "fr", text: "Français" },
  { value: "es", text: "Español" },
  { value: "de", text: "Deutsch" },
  { value: "it", text: "Italian" },
];
const WORDS_PER_PAGE = 4;

let words = [];
let draggedWord = null;
let currentIndex = 0;
let correctCount = 0;
let incorrectCount = 0;

document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
  initializeUI();
  initializeDarkMode();
  setupEventListeners();
  fetchWords(document.getElementById("languageDropdown").value);
});

function setupEventListeners() {
  document
    .getElementById("languageDropdown")
    ?.addEventListener("change", () => {
      fetchWords(document.getElementById("languageDropdown").value);
    });

  document
    .getElementById("prevButton")
    ?.addEventListener("click", showPreviousWords);
  document
    .getElementById("nextButton")
    ?.addEventListener("click", showNextWords);
  document.getElementById("backToHome")?.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  document
    .getElementById("theme-toggle")
    ?.addEventListener("change", toggleTheme);
}

function checkAuthStatus() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to play.");
    window.location.href = "login.html";
  }
}

function initializeUI() {
  const app = document.getElementById("app");

  const themeToggle = document.createElement("div");
  themeToggle.className = "theme-switch";
  themeToggle.innerHTML = `
    <input type="checkbox" id="theme-toggle">
    <label for="theme-toggle" title="Toggle dark mode">
      ${localStorage.getItem("theme") === "dark" ? "☀️" : "🌙"}
    </label>
  `;
  app.appendChild(themeToggle);

  const gameContainer = document.createElement("div");
  gameContainer.className = "game-container";

  const title = document.createElement("h1");
  title.innerHTML = '<i class="fas fa-hand-paper"></i> Drag and Drop Game';
  gameContainer.appendChild(title);

  const languageDropdown = document.createElement("select");
  languageDropdown.id = "languageDropdown";
  LANGUAGES.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang.value;
    option.textContent = lang.text;
    languageDropdown.appendChild(option);
  });
  gameContainer.appendChild(languageDropdown);

  const scoreboard = document.createElement("div");
  scoreboard.id = "scoreboard";
  scoreboard.innerHTML = `
    <p>Correct answers: <span id="correctCount">0</span></p>
    <p>Incorrect answers: <span id="incorrectCount">0</span></p>
  `;
  gameContainer.appendChild(scoreboard);

  gameContainer.appendChild(createWordsContainer());
  gameContainer.appendChild(createDropContainer());

  const navigationButtons = document.createElement("div");
  navigationButtons.className = "navigation-buttons";
  navigationButtons.innerHTML = `
    <button id="prevButton">Previous</button>
    <button id="nextButton">Next</button>
  `;
  gameContainer.appendChild(navigationButtons);

  const backButton = document.createElement("button");
  backButton.id = "backToHome";
  backButton.textContent = "⬅ Back to Home";
  gameContainer.appendChild(backButton);

  app.appendChild(gameContainer);
}

function createWordsContainer() {
  const container = document.createElement("div");
  container.className = "term-row";
  container.id = "words-container";
  return container;
}

function createDropContainer() {
  const container = document.createElement("div");
  container.className = "translation-row";
  container.id = "drop-container";
  return container;
}

async function fetchWords(language) {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/words/${language}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(error.message || "Error loading words");
      return;
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      words = data;
      currentIndex = 0;
      displayWords();
    } else {
      console.error("No words received from server");
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

function displayWords() {
  const wordsContainer = document.getElementById("words-container");
  const dropContainer = document.getElementById("drop-container");
  wordsContainer.innerHTML = "";
  dropContainer.innerHTML = "";

  const currentWords = words.slice(currentIndex, currentIndex + WORDS_PER_PAGE);
  currentWords.forEach((word) => createWordCard(word, wordsContainer));

  const translations = currentWords.map((word) => ({
    translation: word.translation || "No translation available",
    correctWord: word.word,
  }));

  shuffleArray(translations).forEach((translation) => {
    createTranslationCard(translation, dropContainer);
  });
}

function createWordCard(word, container) {
  const card = document.createElement("div");
  card.className = "word-card";
  card.textContent = word.word;
  card.setAttribute("draggable", "true");
  card.addEventListener("dragstart", dragStart);
  container.appendChild(card);
}

function createTranslationCard(translation, container) {
  const card = document.createElement("div");
  card.className = "icon-card";
  card.textContent = translation.translation;
  card.dataset.translation = translation.correctWord;
  card.addEventListener("dragover", (e) => e.preventDefault());
  card.addEventListener("drop", handleDrop);
  container.appendChild(card);
}

function dragStart(event) {
  draggedWord = event.target;
}

function handleDrop(event) {
  event.preventDefault();
  if (!draggedWord) return;

  const translationCard = event.target;
  const draggedWordText = draggedWord.textContent.trim();
  const correctTranslation = translationCard.dataset.translation;

  if (correctTranslation === draggedWordText) {
    handleCorrectMatch(translationCard, draggedWord);
    correctCount++;
  } else {
    handleIncorrectMatch(translationCard, draggedWord);
    incorrectCount++;
  }

  draggedWord = null;
  updateScoreboard();
}

function handleCorrectMatch(translationCard, wordCard) {
  translationCard.style.backgroundColor = "#036932";
  wordCard.style.backgroundColor = "#036932";
  wordCard.setAttribute("draggable", "false");
  translationCard.classList.add("matched");
}

function handleIncorrectMatch(translationCard, wordCard) {
  translationCard.style.backgroundColor = "#f50000";
  wordCard.style.backgroundColor = "#f50000";
  setTimeout(() => {
    translationCard.style.backgroundColor = "";
    wordCard.style.backgroundColor = "";
  }, 1000);
}

function showPreviousWords() {
  if (currentIndex > 0) {
    currentIndex -= WORDS_PER_PAGE;
    displayWords();
  }
}

function showNextWords() {
  if (currentIndex + WORDS_PER_PAGE < words.length) {
    currentIndex += WORDS_PER_PAGE;
    displayWords();
  }
}

function updateScoreboard() {
  document.getElementById("correctCount").textContent = correctCount;
  document.getElementById("incorrectCount").textContent = incorrectCount;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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
