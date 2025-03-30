document.addEventListener("DOMContentLoaded", function () {
  initializeDarkMode();

  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="container">
      <h1><i class="fas fa-book"></i> Dictionary</h1>

      <label for="wordInput">Enter word:</label>
      <input type="text" id="wordInput" placeholder="Enter word" />

      <label for="languageSelect">Select language:</label>
      <select id="languageSelect">
        <option value="fr">French</option>
        <option value="es">Spanish</option>
        <option value="de">German</option>
        <option value="it">Italian</option>
      </select>

      <button id="searchButton">Search</button>

      <div id="result">
      </div>

      <button id="backToHomeButton" style="display: none"> ⬅ Back to Home</button>
    </div>
  `;

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

  document
    .getElementById("searchButton")
    .addEventListener("click", async function () {
      const word = document.getElementById("wordInput").value;
      const language = document.getElementById("languageSelect").value;

      if (!word || !language) {
        alert("Please enter a word and select a language.");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/words/search?word=${word}&language=${language}`
        );
        const data = await response.json();

        if (response.ok) {
          displayResult(data, language);
        } else {
          displayError(data.message);
        }
      } catch (error) {
        displayError("Something went wrong. Please try again.");
      }
    });

  function displayResult(data, language) {
    const resultDiv = document.getElementById("result");
    const backToHomeButton = document.getElementById("backToHomeButton");

    resultDiv.innerHTML = `
      <div class="result-card">
        <h2>${data.word}</h2>
        <div class="result-details">
          <p class="language">${
            document.getElementById("languageSelect").selectedOptions[0].text
          }</p>
          <p class="translation">${
            data.translation || "Translation not available"
          }</p>
        </div>
      </div>
    `;

    backToHomeButton.style.display = "block";

    backToHomeButton.addEventListener("click", function () {
      window.location.href = "index.html";
    });
  }

  function displayError(message) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `<div class="error-message">${message}</div>`;
  }

  function initializeDarkMode() {
    if (
      localStorage.getItem("theme") === "dark" ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches &&
        !localStorage.getItem("theme"))
    ) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }
});
