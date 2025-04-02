const API_ENDPOINTS = {
  QUIZZES: "https://lingoboost-backend.onrender.com/api/quizzes",
};

const LANGUAGES = [
  { value: "fr", text: "Français" },
  { value: "es", text: "Español" },
  { value: "de", text: "Deutsch" },
  { value: "it", text: "Italian" },
];

const state = {
  currentQuestionIndex: 0,
  questions: [],
  selectedLanguage: "fr",
  correctAnswers: 0,
  totalQuestions: 0,
};

document.addEventListener("DOMContentLoaded", () => {
  checkAuthentication();
  setupQuizUI();
  initializeDarkMode();
  setupEventListeners();

  // Sync theme across tabs
  window.addEventListener("storage", (event) => {
    if (event.key === "theme") {
      initializeDarkMode();
    }
  });
});

function setupQuizUI() {
  const quizContainer = document.getElementById("quiz-container");

  quizContainer.innerHTML = createQuizHTML();

  const languageSelector = document.getElementById("language-selector");
  LANGUAGES.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang.value;
    option.textContent = lang.text;
    languageSelector.appendChild(option);
  });

  quizContainer.appendChild(createThemeToggle());
}

function createThemeToggle() {
  const themeContainer = document.createElement("div");
  themeContainer.className = "theme-toggle-container";

  const themeToggle = document.createElement("div");
  themeToggle.className = "theme-switch";
  themeToggle.innerHTML = `
    <input type="checkbox" id="theme-toggle">
    <label for="theme-toggle" title="Toggle dark mode">
      ${localStorage.getItem("theme") === "dark" ? "☀️" : "🌙"}
    </label>
  `;

  themeContainer.appendChild(themeToggle);
  return themeContainer;
}

function createQuizHTML() {
  return `
    <div class="quiz-content">
      <h2><i class="fas fa-question-circle"></i> Language Quiz</h2>
      <a href="index.html" class="back-btn">⬅ Back to Home</a>

      <div id="scoreboard">
        <span id="correct-score">Correct: 0</span> | 
        <span id="incorrect-score">Incorrect: 0</span>
      </div>

      <label for="language-selector">Choose Language:</label>
      <select id="language-selector"></select>
      <button id="start-quiz-btn">Start quiz</button>

      <div class="question-box" id="question-container"></div>
      <div class="options" id="options-container"></div>

      <div class="buttons">
        <button class="prev-btn" id="prev-btn" style="display: none">Previous</button>
        <div id="gif-container"></div>
        <button class="next-btn" id="next-btn" style="display: none">Next</button>
      </div>
    </div>
  `;
}

function setupEventListeners() {
  document
    .getElementById("theme-toggle")
    ?.addEventListener("change", handleThemeToggle);
  document
    .getElementById("language-selector")
    ?.addEventListener("change", (e) => {
      state.selectedLanguage = e.target.value;
    });
  document
    .getElementById("start-quiz-btn")
    ?.addEventListener("click", startQuiz);
  document
    .getElementById("next-btn")
    ?.addEventListener("click", showNextQuestion);
  document
    .getElementById("prev-btn")
    ?.addEventListener("click", showPreviousQuestion);
}

function checkAuthentication() {
  if (!localStorage.getItem("token")) {
    alert("You must be logged in to play.");
    window.location.href = "login.html";
  }
}

function initializeDarkMode() {
  const themeToggle = document.getElementById("theme-toggle");
  const themeLabel = document.querySelector(".theme-switch label");

  if (!themeToggle || !themeLabel) return;

  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const isDarkMode =
    savedTheme === "dark" || (!savedTheme && systemPrefersDark);

  themeToggle.checked = isDarkMode;
  if (isDarkMode) {
    document.documentElement.setAttribute("data-theme", "dark");
    themeLabel.textContent = "☀️";
  } else {
    document.documentElement.removeAttribute("data-theme");
    themeLabel.textContent = "🌙";
  }
}

function handleThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  const themeLabel = document.querySelector(".theme-switch label");

  if (!themeToggle || !themeLabel) return;

  if (themeToggle.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    themeLabel.textContent = "☀️";
  } else {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
    themeLabel.textContent = "🌙";
  }

  window.dispatchEvent(new CustomEvent("themeChanged"));
}

async function startQuiz() {
  if (!state.selectedLanguage) {
    alert("Please select a language.");
    return;
  }

  try {
    await fetchQuestions(state.selectedLanguage);
  } catch (error) {
    console.error("Error starting quiz:", error);
    document.getElementById("question-container").textContent =
      "Error loading quiz. Please try again.";
  }
}

async function fetchQuestions(language) {
  try {
    const response = await fetch(`${API_ENDPOINTS.QUIZZES}/${language}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch questions");

    const data = await response.json();
    state.questions = data.filter((q) => q.language === language);
    state.totalQuestions = state.questions.length;
    state.currentQuestionIndex = 0;
    state.correctAnswers = 0;

    updateScoreboard();
    renderQuestion();
  } catch (error) {
    console.error("Error fetching questions:", error);
    showErrorMessage();
  }
}

function renderQuestion() {
  const { currentQuestionIndex, questions } = state;
  const questionContainer = document.getElementById("question-container");
  const optionsContainer = document.getElementById("options-container");
  const nextButton = document.getElementById("next-btn");
  const prevButton = document.getElementById("prev-btn");
  const gifContainer = document.getElementById("gif-container");

  if (currentQuestionIndex >= questions.length) {
    showQuizCompletion();
    return;
  }

  const currentQuestion = questions[currentQuestionIndex];
  questionContainer.textContent = currentQuestion.question;
  optionsContainer.innerHTML = "";
  gifContainer.innerHTML = "";

  renderOptions(currentQuestion, optionsContainer);
  updateNavigationButtons(nextButton, prevButton);
}

function updateNavigationButtons(nextButton, prevButton) {
  nextButton.style.display = "inline-block";
  prevButton.style.display =
    state.currentQuestionIndex > 0 ? "inline-block" : "none";
}

function renderOptions(question, container) {
  question.options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("option-btn");
    button.onclick = () => checkAnswer(option, question.answer);
    container.appendChild(button);
  });
}

function checkAnswer(selectedOption, correctAnswer) {
  const isCorrect = selectedOption === correctAnswer;
  const gifContainer = document.getElementById("gif-container");

  if (isCorrect) {
    state.correctAnswers++;
  }

  updateScoreboard();
  showFeedbackGif(isCorrect, gifContainer);
  document.getElementById("next-btn").style.display = "inline-block";
}

function updateScoreboard() {
  document.getElementById(
    "correct-score"
  ).textContent = `Correct: ${state.correctAnswers}`;
  document.getElementById("incorrect-score").textContent = `Incorrect: ${
    state.currentQuestionIndex - state.correctAnswers
  }`;
}

function showNextQuestion() {
  state.currentQuestionIndex++;
  renderQuestion();
}

function showPreviousQuestion() {
  if (state.currentQuestionIndex > 0) {
    state.currentQuestionIndex--;
    renderQuestion();
  }
}

function showQuizCompletion() {
  const questionContainer = document.getElementById("question-container");
  const nextButton = document.getElementById("next-btn");
  const prevButton = document.getElementById("prev-btn");

  questionContainer.textContent = `Quiz completed! Final score: ${state.correctAnswers} / ${state.totalQuestions}`;
  document.getElementById("options-container").innerHTML = "";
  nextButton.style.display = "none";
  prevButton.style.display = "none";
}

function showFeedbackGif(isCorrect, container) {
  container.innerHTML = `
    <img src="./assets/img/${isCorrect ? "correct" : "wrongAn"}.gif" 
         alt="${isCorrect ? "Correct" : "Wrong"}">
  `;
}

function showErrorMessage() {
  document.getElementById("question-container").textContent = state.questions
    .length
    ? "Failed to load questions."
    : "No questions available.";
}
