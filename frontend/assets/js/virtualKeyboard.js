const keyboards = {
  french: [
    "a",
    "z",
    "e",
    "r",
    "t",
    "y",
    "u",
    "i",
    "o",
    "p",
    "q",
    "s",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    "m",
    "w",
    "x",
    "c",
    "v",
    "b",
    "n",
    "à",
    "â",
    "é",
    "è",
    "ù",
    "ç",
    "ô",
  ],
  spanish: [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "ñ",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "á",
    "é",
    "í",
    "ó",
    "ú",
    "ü",
  ],
  german: [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "ä",
    "ö",
    "ü",
    "ß",
  ],
  italian: [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "z",
    "à",
    "è",
    "é",
    "ì",
    "ò",
    "ù",
  ],
};

function createKeyboard(language) {
  const keyboardContainer = document.getElementById("keyboardContainer");
  keyboardContainer.innerHTML = "";

  const languageKeyboard = keyboards[language];

  if (!languageKeyboard) {
    console.error("Tastatura za ovaj jezik nije dostupna.");
    return;
  }

  languageKeyboard.forEach((letter) => {
    const key = document.createElement("button");
    key.textContent = letter;
    key.classList.add("key");
    key.addEventListener("click", () => insertLetter(letter));
    keyboardContainer.appendChild(key);
  });
}

function insertLetter(letter) {
  const inputField = document.getElementById("letterInput");
  inputField.value += letter;
  inputField.focus();
}

document.addEventListener("DOMContentLoaded", () => {
  const languageSelect = document.getElementById("language-selector");

  languageSelect.addEventListener("change", (event) => {
    const selectedLanguage = event.target.value;
    createKeyboard(selectedLanguage);
  });

  const defaultLanguage =
    document.body.getAttribute("data-language") || "french";
  createKeyboard(defaultLanguage);
});
