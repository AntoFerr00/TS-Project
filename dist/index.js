"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// ---------------------------
// Decorator: Log Method Calls
// ---------------------------
function logExecution(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
        console.log(`>> Calling ${propertyKey} with:`, ...args);
        const result = originalMethod.apply(this, args);
        console.log(`<< ${propertyKey} returned:`, result);
        return result;
    };
    return descriptor;
}
// ---------------------------
// Enums for Task Properties
// ---------------------------
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["Pending"] = "Pending";
    TaskStatus["InProgress"] = "In Progress";
    TaskStatus["Completed"] = "Completed";
})(TaskStatus || (TaskStatus = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["Low"] = "Low";
    TaskPriority["Medium"] = "Medium";
    TaskPriority["High"] = "High";
})(TaskPriority || (TaskPriority = {}));
// ---------------------------
// Abstract In-Memory Repository
// ---------------------------
class InMemoryRepository {
    constructor() {
        this.items = [];
        this.nextId = 1;
    }
    add(item) {
        item.id = this.nextId++;
        this.items.push(item);
        return item;
    }
    update(id, updatedItem) {
        const index = this.items.findIndex((item) => item.id === id);
        if (index === -1)
            return undefined;
        this.items[index] = Object.assign(Object.assign({}, this.items[index]), updatedItem);
        return this.items[index];
    }
    remove(id) {
        const initialLength = this.items.length;
        this.items = this.items.filter((item) => item.id !== id);
        return this.items.length < initialLength;
    }
    getById(id) {
        return this.items.find((item) => item.id === id);
    }
    getAll() {
        return this.items;
    }
}
// ---------------------------
// Task Repository
// ---------------------------
class TaskRepository extends InMemoryRepository {
    getByPriority(priority) {
        return this.items.filter((task) => task.priority === priority);
    }
    getDueBefore(date) {
        return this.items.filter((task) => task.dueDate !== undefined && task.dueDate < date);
    }
}
// ---------------------------
// Task Manager Class
// ---------------------------
class TaskManager {
    constructor() {
        this.repository = new TaskRepository();
    }
    addTask(title, description, priority, dueDate) {
        const task = {
            id: 0,
            title,
            description,
            status: TaskStatus.Pending,
            priority,
            dueDate,
        };
        return this.repository.add(task);
    }
    updateTask(id, updates) {
        return this.repository.update(id, updates);
    }
    removeTask(id) {
        return this.repository.remove(id);
    }
    listTasks() {
        return this.repository.getAll();
    }
}
__decorate([
    logExecution
], TaskManager.prototype, "addTask", null);
__decorate([
    logExecution
], TaskManager.prototype, "updateTask", null);
__decorate([
    logExecution
], TaskManager.prototype, "removeTask", null);
__decorate([
    logExecution
], TaskManager.prototype, "listTasks", null);
// ---------------------------
// DOM Interaction
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
    const manager = new TaskManager();
    const taskForm = document.getElementById("taskForm");
    const tasksList = document.getElementById("tasksList");
    // Renders the current tasks in the DOM using Bootstrap list groups
    function renderTasks() {
        tasksList.innerHTML = "";
        const tasks = manager.listTasks();
        tasks.forEach((task) => {
            // Create list group item
            const li = document.createElement("li");
            li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-start", "mb-2");
            // Left side: Task info
            const infoDiv = document.createElement("div");
            infoDiv.innerHTML = `
          <div class="fw-bold">${task.title}</div>
          <small>${task.description || "No description"}</small><br />
          <small>Status: ${task.status} | Priority: ${task.priority} | Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}</small>
        `;
            // Right side: Action buttons
            const btnGroup = document.createElement("div");
            btnGroup.classList.add("btn-group");
            // Update button (example: only updates the title)
            const updateBtn = document.createElement("button");
            updateBtn.classList.add("btn", "btn-warning", "btn-sm");
            updateBtn.textContent = "Update";
            updateBtn.addEventListener("click", () => {
                const newTitle = prompt("Enter new title:", task.title);
                if (newTitle !== null && newTitle.trim() !== "") {
                    manager.updateTask(task.id, { title: newTitle });
                    renderTasks();
                }
            });
            // Remove button
            const removeBtn = document.createElement("button");
            removeBtn.classList.add("btn", "btn-danger", "btn-sm");
            removeBtn.textContent = "Remove";
            removeBtn.addEventListener("click", () => {
                if (confirm(`Are you sure you want to remove task ${task.id}?`)) {
                    manager.removeTask(task.id);
                    renderTasks();
                }
            });
            btnGroup.appendChild(updateBtn);
            btnGroup.appendChild(removeBtn);
            // Combine everything
            li.appendChild(infoDiv);
            li.appendChild(btnGroup);
            tasksList.appendChild(li);
        });
    }
    // Handle form submission to add a new task
    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const titleInput = document.getElementById("title");
        const descriptionInput = document.getElementById("description");
        const prioritySelect = document.getElementById("priority");
        const dueDateInput = document.getElementById("dueDate");
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const priority = prioritySelect.value;
        const dueDate = dueDateInput.value ? new Date(dueDateInput.value) : undefined;
        if (!title) {
            alert("Title is required.");
            return;
        }
        manager.addTask(title, description, priority, dueDate);
        taskForm.reset();
        renderTasks();
    });
    // Initial render
    renderTasks();
});
