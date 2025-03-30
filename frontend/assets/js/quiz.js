document.addEventListener("DOMContentLoaded", function () {
  initializeDarkMode();

  let currentQuestionIndex = 0;
  let questions = [];
  let selectedLanguage = "fr";
  let correctAnswers = 0;
  let totalQuestions = 0;

  const quizContainer = document.getElementById("quiz-container");

  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to play.");
    window.location.href = "login.html";
    return;
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

  const createQuizHTML = function () {
    quizContainer.innerHTML = `
      <div class="quiz-container">
        <h2><i class="fas fa-question-circle"></i> Language Quiz</h2>
        <a href="index.html" class="back-btn">⬅ Back to Home</a>

        <!-- Scoreboard -->
        <div id="scoreboard">
          <span id="correct-score">Correct: 0</span> | 
          <span id="incorrect-score">Incorrect: 0</span>
        </div>

        <!-- Language selection -->
        <label for="language-selector">Choose Language:</label>
        <select id="language-selector">
          <option value="fr">Français</option>
          <option value="es">Español</option>
          <option value="de">Deutsch</option>
          <option value="it">Italian</option>
        </select>
        <button id="start-quiz-btn">Start quiz</button>

        <!-- Question box -->
        <div class="question-box" id="question-container"></div>

        <!-- Options -->
        <div class="options" id="options-container"></div>

        <!-- Navigation buttons -->
        <div class="buttons">
          <button class="prev-btn" id="prev-btn" style="display: none">Previous</button>
          <button class="next-btn" id="next-btn" style="display: none">Next</button>
        </div>
        
        <!-- Feedback GIF -->
        <!-- Empty div for GIF will be added dynamically between buttons -->
      </div>
    `;

    const questionContainer = document.getElementById("question-container");
    const optionsContainer = document.getElementById("options-container");
    const nextButton = document.getElementById("next-btn");
    const prevButton = document.getElementById("prev-btn");
    const languageSelector = document.getElementById("language-selector");
    const startQuizButton = document.getElementById("start-quiz-btn");
    const correctScore = document.getElementById("correct-score");
    const incorrectScore = document.getElementById("incorrect-score");

    const gifContainer = document.createElement("div");
    gifContainer.id = "gif-container";
    const buttonsContainer = document.querySelector(".buttons");
    buttonsContainer.insertBefore(gifContainer, nextButton);

    languageSelector.value = selectedLanguage;

    async function fetchQuestions(language) {
      console.log("Fetching questions for language:", language);
      try {
        const response = await fetch(
          `http://localhost:5000/api/quizzes/${language}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }

        const data = await response.json();
        questions = data.filter(function (question) {
          return question.language === language;
        });

        if (questions.length === 0) {
          questionContainer.textContent =
            "No questions available for this language.";
          return;
        }

        totalQuestions = questions.length;
        currentQuestionIndex = 0;
        correctAnswers = 0;
        updateScoreboard();
        renderQuestion();
      } catch (error) {
        console.error("Error fetching questions:", error);
        questionContainer.textContent = "Failed to load questions.";
      }
    }

    function renderQuestion() {
      if (currentQuestionIndex >= questions.length) {
        questionContainer.textContent = `Quiz completed! Final score: ${correctAnswers} / ${totalQuestions}`;
        optionsContainer.innerHTML = "";
        nextButton.style.display = "none";
        prevButton.style.display = "none";
        return;
      }

      const currentQuestion = questions[currentQuestionIndex];
      questionContainer.textContent = currentQuestion.question;
      optionsContainer.innerHTML = "";
      gifContainer.innerHTML = "";

      currentQuestion.options.forEach(function (option) {
        const button = document.createElement("button");
        button.textContent = option;
        button.classList.add("option-btn");
        button.onclick = function () {
          checkAnswer(option, currentQuestion.answer);
        };
        optionsContainer.appendChild(button);
      });

      nextButton.style.display = "inline-block";
      prevButton.style.display =
        currentQuestionIndex > 0 ? "inline-block" : "none";
    }

    function checkAnswer(selectedOption, correctAnswer) {
      const isCorrect = selectedOption === correctAnswer;

      if (isCorrect) {
        correctAnswers++;
      }

      updateScoreboard();

      gifContainer.innerHTML = `<img src="${
        isCorrect ? "./assets/img/correct.gif" : "./assets/img/wrongAn.gif"
      }" alt="${isCorrect ? "Correct" : "Wrong"}">`;
      nextButton.style.display = "inline-block";
    }

    function updateScoreboard() {
      correctScore.textContent = `Correct: ${correctAnswers}`;
      incorrectScore.textContent = `Incorrect: ${
        currentQuestionIndex - correctAnswers
      }`;
    }

    nextButton.addEventListener("click", function () {
      currentQuestionIndex++;
      renderQuestion();
    });

    prevButton.addEventListener("click", function () {
      if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
      }
    });

    languageSelector.addEventListener("change", function (event) {
      selectedLanguage = event.target.value;
    });

    startQuizButton.addEventListener("click", function () {
      if (!selectedLanguage) {
        alert("Please select a language.");
        return;
      }
      fetchQuestions(selectedLanguage);
    });
  };

  createQuizHTML();
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
