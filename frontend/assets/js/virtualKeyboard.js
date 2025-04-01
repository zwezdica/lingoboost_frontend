const inputField = document.getElementById("inputField");
const addButton = document.getElementById("addButton");
const itemList = document.getElementById("itemList");

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
