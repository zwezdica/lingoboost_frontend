const API_URL = "http://localhost:5000/api/admin";
const ITEMS_PER_PAGE = 6;

let currentUserPage = 1;
let currentLogPage = 1;
let totalUsers = 0;
let totalLogs = 0;
let activeModals = [];

document.addEventListener("DOMContentLoaded", () => {
  initializeAdminPanel();
  initializeDarkMode();
  fetchUsers(currentUserPage);
  fetchLoginLogs(currentLogPage);
  setupEventListeners();
});

function setupEventListeners() {
  document
    .getElementById("back-to-home-button")
    ?.addEventListener("click", () => {
      window.location.href = "index.html";
    });

  document
    .getElementById("update-form")
    ?.addEventListener("submit", handleUpdateUser);
  document
    .getElementById("delete-form")
    ?.addEventListener("submit", handleDeleteUser);

  document
    .querySelector(".theme-toggle")
    ?.addEventListener("click", toggleTheme);
}

function showConfirmationModal(options) {
  closeAllModals();

  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content">
        <h3 class="modal-title">${options.title}</h3>
        <p class="modal-message">${options.message}</p>
        <div class="modal-buttons">
          <button id="modal-cancel" class="modal-button modal-button-cancel">${
            options.cancelText || "Cancel"
          }</button>
          <button id="modal-confirm" class="modal-button ${
            options.danger ? "modal-button-danger" : "modal-button-confirm"
          }">
            ${options.confirmText || "Confirm"}
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    activeModals.push(modal);

    setTimeout(() => modal.classList.add("active"), 10);

    const confirmBtn = document.getElementById("modal-confirm");
    const cancelBtn = document.getElementById("modal-cancel");

    const cleanup = () => {
      modal.classList.remove("active");
      setTimeout(() => {
        if (modal.parentNode === document.body) {
          document.body.removeChild(modal);
        }
        activeModals = activeModals.filter((m) => m !== modal);
      }, 300);
    };

    const handleConfirm = () => {
      confirmBtn.removeEventListener("click", handleConfirm);
      cancelBtn.removeEventListener("click", handleCancel);
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      confirmBtn.removeEventListener("click", handleConfirm);
      cancelBtn.removeEventListener("click", handleCancel);
      cleanup();
      resolve(false);
    };

    confirmBtn.addEventListener("click", handleConfirm);
    cancelBtn.addEventListener("click", handleCancel);
  });
}

function showNotificationModal(options) {
  closeAllModals();

  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content ${options.type || "info"}">
        <h3 class="modal-title">${options.title}</h3>
        <p class="modal-message">${options.message}</p>
        <div class="modal-buttons">
          <button id="modal-ok" class="modal-button modal-button-confirm">
            ${options.okText || "OK"}
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    activeModals.push(modal);

    setTimeout(() => modal.classList.add("active"), 10);

    const okBtn = document.getElementById("modal-ok");

    const cleanup = () => {
      modal.classList.remove("active");
      setTimeout(() => {
        if (modal.parentNode === document.body) {
          document.body.removeChild(modal);
        }
        activeModals = activeModals.filter((m) => m !== modal);
      }, 300);
    };

    const handleOk = () => {
      okBtn.removeEventListener("click", handleOk);
      cleanup();
      resolve(true);
    };

    okBtn.addEventListener("click", handleOk);

    if (options.autoClose) {
      setTimeout(() => {
        cleanup();
        resolve(true);
      }, options.autoClose);
    }
  });
}

function closeAllModals() {
  activeModals.forEach((modal) => {
    modal.classList.remove("active");
    if (modal.parentNode === document.body) {
      document.body.removeChild(modal);
    }
  });
  activeModals = [];
}

function showMessage(message) {
  return showNotificationModal({
    title: "Success",
    message: message,
    type: "success",
    okText: "OK",
    autoClose: 3000,
  });
}

function showError(message) {
  return showNotificationModal({
    title: "Error",
    message: message,
    type: "error",
    okText: "OK",
  });
}

function initializeAdminPanel() {
  document.body.innerHTML = `
    <div class="container">
      <h1>Admin Panel</h1>
      <button id="back-to-home-button">Back to Home</button>
      <section id="users-container">
        <h2>User List</h2>
        <div id="users"></div>
        <div id="user-pagination" class="pagination-container"></div>
      </section>
      <section id="logs-container">
        <h2>Login Logs</h2>
        <div id="logs"></div>
        <div id="log-pagination" class="pagination-container"></div>
      </section>
      <section id="update-user">
        <h2>Update User</h2>
        <form id="update-form">
          <input type="text" id="userId" placeholder="User ID" required />
          <input type="text" id="username" placeholder="Username" required />
          <input type="email" id="email" placeholder="Email" required />
          <select id="role" required>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <button type="submit">Update User</button>
        </form>
      </section>
      <section id="delete-user">
        <h2>Delete User</h2>
        <form id="delete-form">
          <input type="text" id="deleteUserId" placeholder="User ID" required />
          <button type="submit">Delete User</button>
        </form>
      </section>
    </div>
  `;
}

function initializeDarkMode() {
  let themeToggle = document.querySelector(".theme-toggle");
  if (!themeToggle) {
    themeToggle = document.createElement("button");
    themeToggle.className = "theme-toggle";
    document.body.appendChild(themeToggle);
  }

  const isDarkMode = localStorage.getItem("theme") === "dark";
  themeToggle.innerHTML = isDarkMode ? "☀️" : "🌙";

  if (isDarkMode) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
}

function toggleTheme() {
  const themeToggle = document.querySelector(".theme-toggle");
  if (!themeToggle) return;

  if (document.documentElement.getAttribute("data-theme") === "dark") {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
    themeToggle.innerHTML = "🌙";
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    themeToggle.innerHTML = "☀️";
  }
}

async function fetchUsers(page = 1) {
  try {
    const response = await fetch(
      `${API_URL}/users?page=${page}&limit=${ITEMS_PER_PAGE}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const users = data.users || data.data || [];
    totalUsers = data.total || data.totalUsers || 0;
    const totalPages =
      data.totalPages || Math.ceil(totalUsers / ITEMS_PER_PAGE);

    currentUserPage = page;
    renderUsers(users);
    renderUserPagination(totalPages);
  } catch (error) {
    console.error("Error fetching users:", error);
    showError("Failed to load users. Please try again.");
    resetUserPagination();
  }
}

function renderUsers(users) {
  const usersContainer = document.getElementById("users");
  usersContainer.innerHTML =
    users.length > 0
      ? users
          .map(
            (user) => `
        <div class="user">
          <p><strong>ID:</strong> ${user._id}</p>
          <p><strong>Username:</strong> ${user.username}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Role:</strong> ${user.role}</p>
        </div>
      `
          )
          .join("")
      : "<p>No users found</p>";
}

function renderUserPagination(totalPages) {
  const paginationContainer = document.getElementById("user-pagination");
  currentUserPage = Math.min(Math.max(1, currentUserPage), totalPages);

  paginationContainer.innerHTML =
    totalPages > 1
      ? `
      <div class="pagination-controls">
        <button id="prev-user" ${currentUserPage <= 1 ? "disabled" : ""}>
          Previous
        </button>
        <span>Page ${currentUserPage} of ${totalPages}</span>
        <button id="next-user" ${
          currentUserPage >= totalPages ? "disabled" : ""
        }>
          Next
        </button>
      </div>
    `
      : "";

  document.getElementById("prev-user")?.addEventListener("click", () => {
    fetchUsers(currentUserPage - 1);
  });

  document.getElementById("next-user")?.addEventListener("click", () => {
    fetchUsers(currentUserPage + 1);
  });
}

function resetUserPagination() {
  currentUserPage = 1;
  totalUsers = 0;
  renderUsers([]);
  renderUserPagination(1);
}

async function handleUpdateUser(e) {
  e.preventDefault();
  const userId = document.getElementById("userId").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const role = document.getElementById("role").value;

  if (!userId || !username || !email) {
    await showError("All fields are required");
    return;
  }

  const confirmed = await showConfirmationModal({
    title: "Update User",
    message: `Are you sure you want to update user ${username} (${email}) to role ${role}?`,
    confirmText: "Update",
    cancelText: "Cancel",
  });

  if (!confirmed) return;

  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ username, email, role }),
    });

    if (!response.ok) throw new Error("Failed to update user");

    await showMessage("User updated successfully");
    document.getElementById("update-form").reset();
    fetchUsers(currentUserPage);
  } catch (error) {
    console.error("Error updating user:", error);
    await showError("Failed to update user");
  }
}

async function handleDeleteUser(e) {
  e.preventDefault();
  const userId = document.getElementById("deleteUserId").value.trim();

  if (!userId) {
    await showError("User ID is required");
    return;
  }

  // Remove "ID: " prefix if present
  const cleanUserId = userId.replace(/^ID:\s*/i, "");

  const confirmed = await showConfirmationModal({
    title: "Delete User",
    message: "Are you sure you want to permanently delete this user?",
    confirmText: "Delete",
    danger: true,
    cancelText: "Cancel",
  });

  if (!confirmed) return;

  try {
    const response = await fetch(`${API_URL}/users/${cleanUserId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete user");
    }

    await showMessage("User deleted successfully");
    document.getElementById("delete-form").reset();
    fetchUsers(currentUserPage);
  } catch (error) {
    console.error("Error deleting user:", error);
    await showError(error.message || "Failed to delete user");
  }
}

async function fetchLoginLogs(page = 1) {
  try {
    const response = await fetch(
      `${API_URL}/loginLogs?page=${page}&limit=${ITEMS_PER_PAGE}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const logs = data.logs || data.data || [];
    totalLogs = data.total || data.totalLogs || 0;
    const totalPages = data.totalPages || Math.ceil(totalLogs / ITEMS_PER_PAGE);

    currentLogPage = page;
    renderLogs(logs);
    renderLogPagination(totalPages);
  } catch (error) {
    console.error("Error fetching logs:", error);
    showError("Failed to load logs. Please try again.");
    resetLogPagination();
  }
}

function renderLogs(logs) {
  const logsContainer = document.getElementById("logs");
  logsContainer.innerHTML =
    logs.length > 0
      ? logs
          .map(
            (log) => `
        <div class="log">
          <p><strong>Username:</strong> ${log.username}</p>
          <p><strong>Timestamp:</strong> ${new Date(
            log.timestamp
          ).toLocaleString()}</p>
          <button class="delete-log-button" data-log-id="${
            log._id
          }">Delete</button>
        </div>
      `
          )
          .join("")
      : "<p>No logs found</p>";

  document.querySelectorAll(".delete-log-button").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const logId = e.target.getAttribute("data-log-id");
      const confirmed = await showConfirmationModal({
        title: "Delete Log",
        message: "Are you sure you want to delete this login log?",
        confirmText: "Delete",
        danger: true,
        cancelText: "Cancel",
      });

      if (confirmed) {
        await deleteLog(logId);
      }
    });
  });
}

function renderLogPagination(totalPages) {
  const paginationContainer = document.getElementById("log-pagination");
  currentLogPage = Math.min(Math.max(1, currentLogPage), totalPages);

  paginationContainer.innerHTML =
    totalPages > 1
      ? `
      <div class="pagination-controls">
        <button id="prev-log" ${currentLogPage <= 1 ? "disabled" : ""}>
          Previous
        </button>
        <span>Page ${currentLogPage} of ${totalPages}</span>
        <button id="next-log" ${currentLogPage >= totalPages ? "disabled" : ""}>
          Next
        </button>
      </div>
    `
      : "";

  document.getElementById("prev-log")?.addEventListener("click", () => {
    fetchLoginLogs(currentLogPage - 1);
  });

  document.getElementById("next-log")?.addEventListener("click", () => {
    fetchLoginLogs(currentLogPage + 1);
  });
}

function resetLogPagination() {
  currentLogPage = 1;
  totalLogs = 0;
  renderLogs([]);
  renderLogPagination(1);
}

async function deleteLog(logId) {
  try {
    const response = await fetch(`${API_URL}/loginLogs/${logId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (!response.ok) throw new Error("Failed to delete log");

    await showMessage("Log deleted successfully");
    fetchLoginLogs(currentLogPage);
  } catch (error) {
    console.error("Error deleting log:", error);
    await showError("Failed to delete log");
  }
}
