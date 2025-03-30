document.addEventListener("DOMContentLoaded", function () {
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

  const flashcardsContainer = document.createElement("div");
  flashcardsContainer.className = "flashcards";
  app.appendChild(flashcardsContainer);

  const title = document.createElement("h2");
  title.innerHTML = '<i class="fas fa-clone"></i> Flashcards';
  flashcardsContainer.appendChild(title);

  const backToHomeBtn = document.createElement("a");
  backToHomeBtn.id = "back-to-home";
  backToHomeBtn.className = "back-btn";
  backToHomeBtn.href = "index.html";
  backToHomeBtn.innerHTML = "⬅ Back to Home";
  flashcardsContainer.appendChild(backToHomeBtn);

  const languageLabel = document.createElement("label");
  languageLabel.setAttribute("for", "language-selector");
  languageLabel.textContent = "Choose Language:";
  flashcardsContainer.appendChild(languageLabel);

  const languageSelector = document.createElement("select");
  languageSelector.id = "language-selector";

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

  const previousBtn = document.createElement("button");
  previousBtn.id = "previous-btn";
  previousBtn.className = "prev-btn";
  previousBtn.textContent = "Previous";
  navigationButtons.appendChild(previousBtn);

  const nextBtn = document.createElement("button");
  nextBtn.id = "next-btn";
  nextBtn.className = "next-btn";
  nextBtn.textContent = "Next";
  navigationButtons.appendChild(nextBtn);

  flashcardsContainer.appendChild(navigationButtons);

  let currentPage = 1;
  let selectedLanguage = "fr";

  async function fetchFlashcards() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in!");
        window.location.href = "login.html";
        return;
      }

      loadingMessage.style.display = "block";

      const response = await fetch(
        `http://localhost:5000/api/flashcards/${selectedLanguage}?page=${currentPage}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error(error.message || "Error loading flashcards.");
        return;
      }

      const data = await response.json();
      flashcardsContent.innerHTML = "";
      loadingMessage.style.display = "none";

      const flashcards = Array.isArray(data.flashcards) ? data.flashcards : [];
      if (!flashcards.length) {
        console.error("No flashcards found!");
        return;
      }

      flashcards.forEach((card) => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("flashcard");
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

        cardElement
          .querySelector(".speak-btn")
          .addEventListener("click", (event) => {
            event.stopPropagation();
            speakWord(card.translation, selectedLanguage);
          });

        cardElement.addEventListener("click", () => {
          cardElement.classList.toggle("flipped");
        });

        flashcardsContent.appendChild(cardElement);
      });

      previousBtn.style.display = currentPage > 1 ? "block" : "none";
    } catch (err) {
      console.error("Error fetching flashcards:", err);
    }
  }

  function speakWord(word, lang) {
    const utterance = new SpeechSynthesisUtterance(word);
    const languageMap = { fr: "fr-FR", es: "es-ES", de: "de-DE", it: "it-IT" };

    if (languageMap[lang]) {
      utterance.lang = languageMap[lang];
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(
        (voice) => voice.lang === languageMap[lang]
      );

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      speechSynthesis.speak(utterance);
    } else {
      console.warn(`Language "${lang}" is not supported for speech synthesis.`);
    }
  }

  speechSynthesis.onvoiceschanged = () => {
    console.log("Voices loaded:", speechSynthesis.getVoices());
  };

  languageSelector.addEventListener("change", (e) => {
    selectedLanguage = e.target.value;
    currentPage = 1;
    fetchFlashcards();
  });

  nextBtn.addEventListener("click", () => {
    currentPage++;
    fetchFlashcards();
  });

  previousBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchFlashcards();
    }
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

  fetchFlashcards();
});

function initializeDarkMode() {}
