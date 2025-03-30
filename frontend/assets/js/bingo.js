document.addEventListener("DOMContentLoaded", () => {
  initializeDarkMode();

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

  const title = document.createElement("h1");
  title.innerHTML = '<i class="fas fa-gamepad"></i> Bingo Game';
  app.appendChild(title);

  const selectorContainer = document.createElement("div");
  selectorContainer.className = "selector-container";
  app.appendChild(selectorContainer);

  const levelContainer = document.createElement("div");
  levelContainer.className = "selector-item";

  const levelLabel = document.createElement("label");
  levelLabel.setAttribute("for", "level-selector");
  levelLabel.textContent = "Choose difficulty:";
  levelContainer.appendChild(levelLabel);

  const levelSelector = document.createElement("select");
  levelSelector.id = "level-selector";

  const difficulties = [
    { value: "easy", text: "Easy" },
    { value: "medium", text: "Medium" },
    { value: "hard", text: "Hard" },
  ];

  difficulties.forEach((difficulty) => {
    const option = document.createElement("option");
    option.value = difficulty.value;
    option.textContent = difficulty.text;
    levelSelector.appendChild(option);
  });

  levelContainer.appendChild(levelSelector);
  selectorContainer.appendChild(levelContainer);

  const languageContainer = document.createElement("div");
  languageContainer.className = "selector-item";

  const languageLabel = document.createElement("label");
  languageLabel.setAttribute("for", "language-selector");
  languageLabel.textContent = "Choose language:";
  languageContainer.appendChild(languageLabel);

  const languageSelector = document.createElement("select");
  languageSelector.id = "language-selector";

  const languages = [
    { value: "fr", text: "Français" },
    { value: "es", text: "Español" },
    { value: "de", text: "Deutsch" },
    { value: "it", text: "Italian" },
  ];

  languages.forEach((language) => {
    const option = document.createElement("option");
    option.value = language.value;
    option.textContent = language.text;
    languageSelector.appendChild(option);
  });

  languageContainer.appendChild(languageSelector);
  selectorContainer.appendChild(languageContainer);

  const startButton = document.createElement("button");
  startButton.id = "start-button";
  startButton.textContent = "Start Game";
  selectorContainer.appendChild(startButton);

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

  const modal = document.createElement("div");
  modal.id = "modal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <span id="close-modal">&times;</span>
      <h2 id="modal-title"></h2>
      <p id="modal-message"></p>
    </div>
  `;
  app.appendChild(modal);

  const translationModal = document.createElement("div");
  translationModal.id = "translation-modal";
  translationModal.className = "modal";
  translationModal.innerHTML = `
    <div class="modal-content">
      <span id="close-translation-modal">&times;</span>
      <h2 id="translation-modal-title"></h2>
      <input type="text" id="translation-input" placeholder="Enter translation" />
      <button id="submit-translation">Submit</button>
    </div>
  `;
  app.appendChild(translationModal);

  let score = 0;
  let currentWord = null;

  function showModal(title, message) {
    const modalTitle = document.getElementById("modal-title");
    const modalMessage = document.getElementById("modal-message");
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.style.display = "block";
  }

  const closeModal = document.getElementById("close-modal");
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  function showTranslationModal(word) {
    currentWord = word;
    const translationModalTitle = document.getElementById(
      "translation-modal-title"
    );
    translationModalTitle.textContent = `Translate the word "${word.word}" to ${
      languageSelector.options[languageSelector.selectedIndex].text
    }:`;
    const translationInput = document.getElementById("translation-input");
    translationInput.value = "";
    translationModal.style.display = "block";
  }

  const closeTranslationModal = document.getElementById(
    "close-translation-modal"
  );
  closeTranslationModal.addEventListener("click", () => {
    translationModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === translationModal) {
      translationModal.style.display = "none";
    }
  });

  const submitTranslation = document.getElementById("submit-translation");
  submitTranslation.addEventListener("click", async () => {
    const translationInput = document.getElementById("translation-input");
    const userTranslation = translationInput.value.trim().toLowerCase();
    if (userTranslation) {
      translationModal.style.display = "none";
      await checkTranslation(currentWord, userTranslation);
    }
  });

  startButton.addEventListener("click", async () => {
    const level = levelSelector.value;
    try {
      const response = await fetch(
        `http://localhost:5000/api/bingo/words?level=${level}`
      );
      if (!response.ok) {
        throw new Error("Error fetching words");
      }
      const { words } = await response.json();
      generateBingoTable(words);
    } catch (error) {
      console.error("An error occurred:", error);
      showModal(
        "Error",
        "An error occurred while loading words. Please try again."
      );
    }
  });

  function generateBingoTable(words) {
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

  async function checkTranslation(word, userTranslation) {
    const selectedLanguage = languageSelector.value;
    try {
      const response = await fetch(
        "http://localhost:5000/api/bingo/check-translation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wordId: word._id,
            language: selectedLanguage,
            userTranslation: userTranslation.toLowerCase(),
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Error checking translation");
      }
      const { isCorrect, correctTranslation } = await response.json();
      if (isCorrect) {
        showModal(
          "Correct!",
          `The correct translation is: ${correctTranslation}`
        );
        score += 10;
        scoreDisplay.textContent = `Score: ${score}`;
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

  backToHomeButton.addEventListener("click", () => {
    window.location.href = "index.html";
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

function initializeDarkMode() {}
