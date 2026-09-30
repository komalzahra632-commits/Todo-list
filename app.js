const STORAGE_KEY = "daymark.tasks.v1";

const form = document.querySelector("#add-form");
const input = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const progressCopy = document.querySelector("#progress-copy");
const emptyState = document.querySelector("#empty-state");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll(".filter-button");

let tasks = loadTasks();
let activeFilter = "all";

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(savedTasks)) return [];

    return savedTasks.filter((task) =>
      task && typeof task.id === "string" && typeof task.text === "string" && typeof task.completed === "boolean"
    );
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    progressCopy.textContent = "Your browser could not save this list.";
  }
}

function renderTasks() {
  const visibleTasks = tasks.filter((task) => {
    if (activeFilter === "active") return !task.completed;
    if (activeFilter === "completed") return task.completed;
    return true;
  });
  const remainingCount = tasks.filter((task) => !task.completed).length;

  taskList.replaceChildren();
  for (const task of visibleTasks) {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " is-complete" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.className = "task-check";
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `${task.completed ? "Mark as not done" : "Mark as done"}: ${task.text}`);
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "🗑️";
    deleteButton.setAttribute("aria-label", `Delete task: ${task.text}`);
    deleteButton.title = "Delete task";
    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((savedTask) => savedTask.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, text, deleteButton);
    taskList.append(item);
  }

  taskCount.textContent = String(tasks.length);
  progressCopy.textContent = tasks.length === 0
    ? "A little progress goes a long way."
    : remainingCount === 0
      ? "Everything on your list is done. Nice work!"
      : `${remainingCount} ${remainingCount === 1 ? "task" : "tasks"} left to do.`;
  emptyState.hidden = visibleTasks.length > 0;
  clearCompletedButton.hidden = !tasks.some((task) => task.completed);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  tasks.unshift({ id: crypto.randomUUID(), text, completed: false });
  saveTasks();
  input.value = "";
  activeFilter = "all";
  updateFilters();
  renderTasks();
  input.focus();
});

function updateFilters() {
  for (const button of filterButtons) {
    const isActive = button.dataset.filter === activeFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
}

for (const button of filterButtons) {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    updateFilters();
    renderTasks();
  });
}

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();