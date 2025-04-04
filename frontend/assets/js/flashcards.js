const API_URL = "https://lingoboost-backend.onrender.com/api/flashcards";
const LANGUAGES = [
  { value: "fr", text: "Français" },
  { value: "es", text: "Español" },
  { value: "de", text: "Deutsch" },
  { value: "it", text: "Italian" },
];
const LANGUAGE_VOICES = {
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE",
  it: "it-IT",
};

let currentPage = 1;
let selectedLanguage = localStorage.getItem("selectedLanguage") || "fr";

document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
  initializeUI();
  initializeDarkMode();
  setupEventListeners();
  fetchFlashcards();
});

function setupEventListeners() {
  document
    .getElementById("language-selector")
    ?.addEventListener("change", (e) => {
      selectedLanguage = e.target.value;
      currentPage = 1;
      fetchFlashcards();
    });

  document.getElementById("next-btn")?.addEventListener("click", () => {
    currentPage++;
    fetchFlashcards();
  });

  document.getElementById("previous-btn")?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchFlashcards();
    }
  });

  document
    .getElementById("theme-toggle")
    ?.addEventListener("change", toggleTheme);
}

function checkAuthStatus() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in!");
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

  const themeToggle = document.createElement("div");
  themeToggle.className = "theme-switch";
  themeToggle.innerHTML = `
    <input type="checkbox" id="theme-toggle">
    <label for="theme-toggle" title="Toggle dark mode">
      ${localStorage.getItem("theme") === "dark" ? "☀️" : "🌙"}
    </label>
  `;
  app.appendChild(themeToggle);

  const flashcardsContainer = document.createElement("div");
  flashcardsContainer.className = "flashcards";

  const title = document.createElement("h2");
  title.innerHTML = '<i class="fas fa-clone"></i> Flashcards';
  flashcardsContainer.appendChild(title);

  const backButton = document.createElement("a");
  backButton.id = "back-to-home";
  backButton.className = "back-btn";
  backButton.href = "index.html";
  backButton.innerHTML = "⬅ Back to Home";
  flashcardsContainer.appendChild(backButton);

  const languageLabel = document.createElement("label");
  languageLabel.setAttribute("for", "language-selector");
  languageLabel.textContent = "Choose Language:";
  flashcardsContainer.appendChild(languageLabel);

  const languageSelector = document.createElement("select");
  languageSelector.id = "language-selector";
  LANGUAGES.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang.value;
    option.textContent = lang.text;
    option.selected = lang.value === selectedLanguage;
    languageSelector.appendChild(option);
  });
  flashcardsContainer.appendChild(languageSelector);

  const loadingMessage = document.createElement("div");
  loadingMessage.id = "loading-message";
  loadingMessage.className = "loading-message";
  loadingMessage.textContent = "Please select a language to load flashcards.";
  flashcardsContainer.appendChild(loadingMessage);

  const flashcardsContent = document.createElement("div");
  flashcardsContent.id = "flashcards-container";
  flashcardsContent.className = "flashcard-container";
  flashcardsContainer.appendChild(flashcardsContent);

  const navigationButtons = document.createElement("div");
  navigationButtons.className = "navigation-buttons";
  navigationButtons.innerHTML = `
    <button id="previous-btn" class="prev-btn">Previous</button>
    <button id="next-btn" class="next-btn">Next</button>
  `;
  flashcardsContainer.appendChild(navigationButtons);

  app.appendChild(flashcardsContainer);
}

async function fetchFlashcards() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    showLoading(true);

    const response = await fetch(
      `${API_URL}/${selectedLanguage}?page=${currentPage}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error loading flashcards");
    }

    const data = await response.json();
    showLoading(false);
    renderFlashcards(data.flashcards || []);
    updateNavigation();
  } catch (error) {
    console.error("Fetch error:", error);
    showLoading(false);
  }
}

function renderFlashcards(flashcards) {
  const container = document.getElementById("flashcards-container");
  container.innerHTML = "";

  if (!flashcards.length) {
    container.innerHTML = "<p>No flashcards found</p>";
    return;
  }

  flashcards.forEach((card) => {
    const cardElement = document.createElement("div");
    cardElement.className = "flashcard";
    cardElement.innerHTML = `
      <div class="flashcard-inner">
        <div class="flashcard-front">
          <div class="word">${card.word}</div>
        </div>
        <div class="flashcard-back">
          <div class="translation">${card.translation}</div>
          <button class="speak-btn">🔊</button>
        </div>
      </div>
    `;

    cardElement.addEventListener("click", () => {
      cardElement.classList.toggle("flipped");
    });

    cardElement.querySelector(".speak-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      speakWord(card.translation, selectedLanguage);
    });

    container.appendChild(cardElement);
  });
}

function updateNavigation() {
  const prevBtn = document.getElementById("previous-btn");
  prevBtn.style.display = currentPage > 1 ? "block" : "none";
}

function showLoading(show) {
  document.getElementById("loading-message").style.display = show
    ? "block"
    : "none";
}

function speakWord(word, lang) {
  if (!LANGUAGE_VOICES[lang]) {
    console.warn(`Language "${lang}" not supported for speech`);
    return;
  }

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = LANGUAGE_VOICES[lang];

  const voices = speechSynthesis.getVoices();
  const voice = voices.find((v) => v.lang === LANGUAGE_VOICES[lang]);

  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
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

speechSynthesis.onvoiceschanged = () => {
  console.log("Voices loaded:", speechSynthesis.getVoices());
};
