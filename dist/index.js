"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
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
            id: 0, // Will be overridden in repository.add
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
// Command Line Interface Setup
// ---------------------------
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
function question(query) {
    return new Promise((resolve) => rl.question(query, resolve));
}
// ---------------------------
// Main CLI Application Loop
// ---------------------------
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const manager = new TaskManager();
        let exit = false;
        while (!exit) {
            console.log("\nTask Manager Menu:");
            console.log("1. Add Task");
            console.log("2. Update Task");
            console.log("3. Remove Task");
            console.log("4. List Tasks");
            console.log("5. Exit");
            const choice = yield question("Choose an option: ");
            switch (choice.trim()) {
                case "1": {
                    const title = yield question("Enter task title: ");
                    if (title.trim() === "") {
                        console.log("Title is required.");
                        break;
                    }
                    const description = yield question("Enter task description: ");
                    const priorityInput = yield question("Enter task priority (Low, Medium, High): ");
                    let priority;
                    if (priorityInput.toLowerCase() === "low") {
                        priority = TaskPriority.Low;
                    }
                    else if (priorityInput.toLowerCase() === "high") {
                        priority = TaskPriority.High;
                    }
                    else {
                        priority = TaskPriority.Medium;
                    }
                    const dueDateInput = yield question("Enter due date (YYYY-MM-DD) or leave blank: ");
                    let dueDate = undefined;
                    if (dueDateInput.trim() !== "") {
                        const parsedDate = new Date(dueDateInput);
                        if (!isNaN(parsedDate.getTime())) {
                            dueDate = parsedDate;
                        }
                        else {
                            console.log("Invalid date format. Due date will be ignored.");
                        }
                    }
                    const task = manager.addTask(title.trim(), description.trim(), priority, dueDate);
                    console.log("Task added:", task);
                    break;
                }
                case "2": {
                    const idStr = yield question("Enter task ID to update: ");
                    const id = parseInt(idStr);
                    if (isNaN(id)) {
                        console.log("Invalid task ID.");
                        break;
                    }
                    const newTitle = yield question("Enter new title (leave blank to keep unchanged): ");
                    const newDescription = yield question("Enter new description (leave blank to keep unchanged): ");
                    const newPriorityInput = yield question("Enter new priority (Low, Medium, High) (leave blank to keep unchanged): ");
                    const newDueDateInput = yield question("Enter new due date (YYYY-MM-DD) (leave blank to keep unchanged): ");
                    const updates = {};
                    if (newTitle.trim() !== "") {
                        updates.title = newTitle.trim();
                    }
                    if (newDescription.trim() !== "") {
                        updates.description = newDescription.trim();
                    }
                    if (newPriorityInput.trim() !== "") {
                        const priorityVal = newPriorityInput.toLowerCase();
                        if (priorityVal === "low") {
                            updates.priority = TaskPriority.Low;
                        }
                        else if (priorityVal === "high") {
                            updates.priority = TaskPriority.High;
                        }
                        else if (priorityVal === "medium") {
                            updates.priority = TaskPriority.Medium;
                        }
                    }
                    if (newDueDateInput.trim() !== "") {
                        const parsedDate = new Date(newDueDateInput);
                        if (!isNaN(parsedDate.getTime())) {
                            updates.dueDate = parsedDate;
                        }
                        else {
                            console.log("Invalid date format. Due date will be unchanged.");
                        }
                    }
                    const updatedTask = manager.updateTask(id, updates);
                    if (updatedTask) {
                        console.log("Task updated:", updatedTask);
                    }
                    else {
                        console.log("Task not found.");
                    }
                    break;
                }
                case "3": {
                    const idStr = yield question("Enter task ID to remove: ");
                    const id = parseInt(idStr);
                    if (isNaN(id)) {
                        console.log("Invalid task ID.");
                        break;
                    }
                    const removed = manager.removeTask(id);
                    if (removed) {
                        console.log(`Task ${id} removed.`);
                    }
                    else {
                        console.log("Task not found.");
                    }
                    break;
                }
                case "4": {
                    const tasks = manager.listTasks();
                    if (tasks.length === 0) {
                        console.log("No tasks available.");
                    }
                    else {
                        console.log("Current tasks:");
                        tasks.forEach((task) => {
                            console.log(`ID: ${task.id}, Title: ${task.title}, Description: ${task.description || "No description"}, Status: ${task.status}, Priority: ${task.priority}, Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}`);
                        });
                    }
                    break;
                }
                case "5":
                    exit = true;
                    break;
                default:
                    console.log("Invalid option. Please try again.");
            }
        }
        rl.close();
        console.log("Goodbye!");
    });
}
main();
