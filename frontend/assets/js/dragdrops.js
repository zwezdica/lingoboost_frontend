document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  if (!token) {
    alert("You must be logged in to play.");
    window.location.href = "login.html";
    return;
  }

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

  const gameContainer = document.createElement("div");
  gameContainer.className = "game-container";
  app.appendChild(gameContainer);

  const title = document.createElement("h1");
  title.innerHTML = '<i class="fas fa-hand-paper"></i> Drag and Drop Game';
  gameContainer.appendChild(title);

  const languageDropdown = document.createElement("select");
  languageDropdown.id = "languageDropdown";

  const languages = [
    { value: "fr", text: "Français" },
    { value: "es", text: "Español" },
    { value: "de", text: "Deutsch" },
    { value: "it", text: "Italian" },
  ];

  languages.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang.value;
    option.textContent = lang.text;
    languageDropdown.appendChild(option);
  });

  gameContainer.appendChild(languageDropdown);

  const scoreboard = document.createElement("div");
  scoreboard.id = "scoreboard";

  const correctAnswers = document.createElement("p");
  correctAnswers.innerHTML =
    'Correct answers: <span id="correctCount">0</span>';
  scoreboard.appendChild(correctAnswers);

  const incorrectAnswers = document.createElement("p");
  incorrectAnswers.innerHTML =
    'Incorrect answers: <span id="incorrectCount">0</span>';
  scoreboard.appendChild(incorrectAnswers);

  gameContainer.appendChild(scoreboard);

  const wordsContainer = document.createElement("div");
  wordsContainer.className = "term-row";
  wordsContainer.id = "words-container";
  gameContainer.appendChild(wordsContainer);

  const dropContainer = document.createElement("div");
  dropContainer.className = "translation-row";
  dropContainer.id = "drop-container";
  gameContainer.appendChild(dropContainer);

  const navigationButtons = document.createElement("div");
  navigationButtons.className = "navigation-buttons";

  const prevButton = document.createElement("button");
  prevButton.id = "prevButton";
  prevButton.textContent = "Previous";
  navigationButtons.appendChild(prevButton);

  const nextButton = document.createElement("button");
  nextButton.id = "nextButton";
  nextButton.textContent = "Next";
  navigationButtons.appendChild(nextButton);

  gameContainer.appendChild(navigationButtons);

  const backToHomeButton = document.createElement("button");
  backToHomeButton.id = "backToHome";
  backToHomeButton.textContent = "⬅ Back to Home";
  gameContainer.appendChild(backToHomeButton);

  let words = [];
  let draggedWord = null;
  let currentIndex = 0;
  let correctCount = 0;
  let incorrectCount = 0;

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async function fetchWords(language) {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to play.");
      window.location.href = "login.html";
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/dragdrops/words/${language}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error(
          error.message || "An error occurred while loading words."
        );
        return;
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        words = data;
        currentIndex = 0;
        displayWords();
      } else {
        console.error("Invalid data received from the server.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  function displayWords() {
    wordsContainer.innerHTML = "";
    dropContainer.innerHTML = "";

    const currentWords = words.slice(currentIndex, currentIndex + 4);

    currentWords.forEach((word) => {
      const wordCard = document.createElement("div");
      wordCard.classList.add("word-card");
      wordCard.textContent = word.word;
      wordCard.setAttribute("draggable", "true");
      wordCard.addEventListener("dragstart", dragStart);
      wordsContainer.appendChild(wordCard);
    });

    const translations = currentWords.map((word) => ({
      translation: word.translation || "No translation available",
      correctWord: word.word,
    }));

    const shuffledTranslations = shuffleArray(translations);

    shuffledTranslations.forEach((translation) => {
      const translationCard = document.createElement("div");
      translationCard.classList.add("icon-card");
      translationCard.textContent = translation.translation;
      translationCard.setAttribute("data-translation", translation.correctWord);
      translationCard.addEventListener("dragover", (event) =>
        event.preventDefault()
      );
      translationCard.addEventListener("drop", function (event) {
        event.preventDefault();
        if (draggedWord) {
          const draggedWordText = draggedWord.textContent.trim();
          const correctTranslation =
            translationCard.getAttribute("data-translation");

          if (correctTranslation === draggedWordText) {
            translationCard.style.backgroundColor = "#036932";
            draggedWord.style.backgroundColor = "#036932";
            draggedWord.setAttribute("draggable", false);
            translationCard.classList.add("matched");
            correctCount++;
          } else {
            translationCard.style.backgroundColor = "#f50000";
            draggedWord.style.backgroundColor = "#f50000";
            incorrectCount++;
            setTimeout(() => {
              translationCard.style.backgroundColor = "";
              draggedWord.style.backgroundColor = "";
            }, 1000);
          }
          draggedWord = null;
          updateScoreboard();
        }
      });
      dropContainer.appendChild(translationCard);
    });
  }

  function dragStart(event) {
    draggedWord = event.target;
  }

  function updateScoreboard() {
    const correctCountDisplay = document.getElementById("correctCount");
    const incorrectCountDisplay = document.getElementById("incorrectCount");
    correctCountDisplay.textContent = correctCount;
    incorrectCountDisplay.textContent = incorrectCount;
  }

  languageDropdown.addEventListener("change", function () {
    fetchWords(languageDropdown.value);
  });

  prevButton.addEventListener("click", function () {
    if (currentIndex > 0) {
      currentIndex -= 4;
      displayWords();
    }
  });

  nextButton.addEventListener("click", function () {
    if (currentIndex + 4 < words.length) {
      currentIndex += 4;
      displayWords();
    }
  });

  backToHomeButton.addEventListener("click", function () {
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

  fetchWords(languageDropdown.value);
});

function initializeDarkMode() {}
