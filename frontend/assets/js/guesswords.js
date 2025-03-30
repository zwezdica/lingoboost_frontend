document.addEventListener("DOMContentLoaded", () => {
  initializeDarkMode();

  const app = document.getElementById("app");
  let userToken = localStorage.getItem("token");
  let score = 0;
  let selectedLanguage = "fr";
  let currentWord = "";
  let currentWordIndex = 0;

  if (!userToken) {
    alert("You must be logged in to play.");
    window.location.href = "login.html";
    return;
  }

  const themeToggleHTML = `
    <div class="theme-switch">
      <input type="checkbox" id="theme-toggle">
      <label for="theme-toggle" title="Toggle dark mode">
        ${localStorage.getItem("theme") === "dark" ? "☀️" : "🌙"}
      </label>
    </div>
  `;

  app.innerHTML = `
    <h1><i class="fas fa-keyboard"></i> Guess Word</h1>
    <div id="language-container">
      <label for="language-selector">Choose a language:</label>
      <select id="language-selector">
        <option value="fr">Français</option>
        <option value="es">Español</option>
        <option value="de">Deutsch</option>
        <option value="it">Italian</option>
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

  app.insertAdjacentHTML("afterbegin", themeToggleHTML);

  const startButton = document.getElementById("start-game");
  const guessButton = document.getElementById("guess-button");
  const languageSelect = document.getElementById("language-selector");
  const letterInput = document.getElementById("letterInput");
  const wordDisplay = document.querySelector(".hidden-word");
  const messageBox = document.getElementById("messageBox");
  const scoreboard = document.getElementById("scoreboard");
  const meaningBox = document.getElementById("meaningBox");
  const backHomeButton = document.getElementById("back-home-button");
  const nextButton = document.getElementById("next-button");
  const previousButton = document.getElementById("previous-button");

  fetchKeyboard(selectedLanguage);

  languageSelect.addEventListener("change", async (event) => {
    selectedLanguage = event.target.value;
    currentWordIndex = 0;
    await fetchKeyboard(selectedLanguage);
  });

  async function fetchKeyboard(language) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/keyboards/${language}`
      );
      const data = await response.json();

      if (response.ok && data.keyboard) {
        displayKeyboard(data.keyboard);
      } else {
        throw new Error("Failed to fetch keyboard");
      }
    } catch (error) {
      console.error("Error fetching keyboard:", error);
      alert("Error loading keyboard");
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
        letterInput.value = key;
        guessLetter(key);
      });
      keyboardContainer.appendChild(keyButton);
    });
  }

  async function startGame() {
    try {
      const response = await fetch(
        `http://localhost:5000/api/guessWords/start?lang=${selectedLanguage}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      const data = await response.json();
      if (response.ok) {
        currentWord = data.hiddenWord;
        wordDisplay.textContent = currentWord;
        meaningBox.textContent = `Meaning: ${data.meaning}`;
        messageBox.textContent = `Game started! Language: ${selectedLanguage.toUpperCase()}`;
      } else {
        messageBox.textContent = data.message;
      }
    } catch (error) {
      console.error("Error starting game:", error);
      messageBox.textContent = "Error starting game. Try again.";
    }
  }

  async function loadNextWord() {
    currentWordIndex++;
    await startGame();
  }

  async function loadPreviousWord() {
    currentWordIndex--;
    await startGame();
  }

  async function guessLetter(letter) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/guessWords/guess/${letter}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      const data = await response.json();
      if (response.ok) {
        wordDisplay.textContent = data.hiddenWord;
        meaningBox.textContent = `Meaning: ${data.meaning}`;

        if (data.success) {
          messageBox.textContent = "Correct guess!";
          if (!data.hiddenWord.includes("_")) {
            messageBox.textContent = "You guessed the word!";
            score++;
            updateScoreboard();
          }
        } else {
          messageBox.textContent = "Wrong guess, try again.";
        }
      } else {
        messageBox.textContent = data.message;
      }
    } catch (error) {
      console.error("Error guessing letter:", error);
      messageBox.textContent = "Error processing guess. Try again.";
    }
  }

  function updateScoreboard() {
    scoreboard.textContent = `Score: ${score}`;
  }

  letterInput.addEventListener("input", () => {
    letterInput.value = letterInput.value.replace(/[^a-zA-Z]/g, "").slice(0, 1);
  });

  startButton.addEventListener("click", startGame);
  guessButton.addEventListener("click", () => {
    const letter = letterInput.value;
    if (letter) guessLetter(letter);
  });

  backHomeButton.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  nextButton.addEventListener("click", loadNextWord);
  previousButton.addEventListener("click", loadPreviousWord);

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
