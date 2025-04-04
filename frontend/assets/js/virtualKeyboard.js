const inputField = document.getElementById("inputField");
const addButton = document.getElementById("addButton");
const itemList = document.getElementById("itemList");

const iconContainer = document.createElement("div");
iconContainer.className = "icon-container";
iconContainer.innerHTML = `
   <svg viewBox="0 0 24 24" width="24" height="24">
  <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
</svg>
`;
iconContainer.style.display = "none";
document.body.appendChild(iconContainer);

addButton.addEventListener("click", addItem);
inputField.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addItem();
  }
});

function addItem() {
  const itemText = inputField.value.trim();
  if (itemText !== "") {
    const newItem = createListItem(itemText);
    itemList.appendChild(newItem);
    inputField.value = "";
  }
}

function createListItem(text) {
  const li = document.createElement("li");
  li.textContent = text;

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", function () {
    li.remove();
  });

  li.appendChild(deleteButton);
  return li;
}
