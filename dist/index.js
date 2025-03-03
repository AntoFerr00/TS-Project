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
            id: 0, // will be assigned by repository
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
    listTasksByPriority(priority) {
        return this.repository.getByPriority(priority);
    }
    listTasksDueBefore(date) {
        return this.repository.getDueBefore(date);
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
__decorate([
    logExecution
], TaskManager.prototype, "listTasksByPriority", null);
__decorate([
    logExecution
], TaskManager.prototype, "listTasksDueBefore", null);
// ---------------------------
// Interactive CLI using readline
// ---------------------------
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
function askQuestion(query) {
    return new Promise((resolve) => rl.question(query, resolve));
}
// ---------------------------
// Interactive Menu Function
// ---------------------------
function interactiveMenu(manager) {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            console.log("\n--- Task Manager Menu ---");
            console.log("1. Add Task");
            console.log("2. Update Task");
            console.log("3. Remove Task");
            console.log("4. List Tasks");
            console.log("5. Exit");
            const choice = yield askQuestion("Select an option: ");
            switch (choice.trim()) {
                case "1": {
                    const title = yield askQuestion("Enter task title: ");
                    const description = yield askQuestion("Enter task description: ");
                    const priorityStr = yield askQuestion("Enter task priority (Low, Medium, High): ");
                    let priority;
                    if (priorityStr.toLowerCase() === "low") {
                        priority = TaskPriority.Low;
                    }
                    else if (priorityStr.toLowerCase() === "high") {
                        priority = TaskPriority.High;
                    }
                    else {
                        priority = TaskPriority.Medium;
                    }
                    const dueDateStr = yield askQuestion("Enter due date (YYYY-MM-DD) or leave blank: ");
                    let dueDate = undefined;
                    if (dueDateStr.trim() !== "") {
                        dueDate = new Date(dueDateStr);
                        if (isNaN(dueDate.getTime())) {
                            console.log("Invalid date. Due date not set.");
                            dueDate = undefined;
                        }
                    }
                    const newTask = manager.addTask(title, description, priority, dueDate);
                    console.log("Added Task:", newTask);
                    break;
                }
                case "2": {
                    const updateIdStr = yield askQuestion("Enter task ID to update: ");
                    const updateId = parseInt(updateIdStr);
                    if (isNaN(updateId)) {
                        console.log("Invalid task ID.");
                        break;
                    }
                    console.log("What would you like to update?");
                    console.log("1. Title");
                    console.log("2. Description");
                    console.log("3. Status");
                    console.log("4. Priority");
                    console.log("5. Due Date");
                    const updateChoice = yield askQuestion("Select an option: ");
                    let updates = {};
                    switch (updateChoice.trim()) {
                        case "1": {
                            const newTitle = yield askQuestion("Enter new title: ");
                            updates.title = newTitle;
                            break;
                        }
                        case "2": {
                            const newDesc = yield askQuestion("Enter new description: ");
                            updates.description = newDesc;
                            break;
                        }
                        case "3": {
                            const newStatusStr = yield askQuestion("Enter new status (Pending, In Progress, Completed): ");
                            let newStatus;
                            if (newStatusStr.toLowerCase() === "pending") {
                                newStatus = TaskStatus.Pending;
                            }
                            else if (newStatusStr.toLowerCase() === "in progress" ||
                                newStatusStr.toLowerCase() === "inprogress") {
                                newStatus = TaskStatus.InProgress;
                            }
                            else if (newStatusStr.toLowerCase() === "completed") {
                                newStatus = TaskStatus.Completed;
                            }
                            else {
                                console.log("Invalid status. Update aborted.");
                                break;
                            }
                            updates.status = newStatus;
                            break;
                        }
                        case "4": {
                            const newPriorityStr = yield askQuestion("Enter new priority (Low, Medium, High): ");
                            let newPriority;
                            if (newPriorityStr.toLowerCase() === "low") {
                                newPriority = TaskPriority.Low;
                            }
                            else if (newPriorityStr.toLowerCase() === "high") {
                                newPriority = TaskPriority.High;
                            }
                            else if (newPriorityStr.toLowerCase() === "medium") {
                                newPriority = TaskPriority.Medium;
                            }
                            else {
                                console.log("Invalid priority. Update aborted.");
                                break;
                            }
                            updates.priority = newPriority;
                            break;
                        }
                        case "5": {
                            const newDueDateStr = yield askQuestion("Enter new due date (YYYY-MM-DD) or leave blank to remove: ");
                            if (newDueDateStr.trim() === "") {
                                updates.dueDate = undefined;
                            }
                            else {
                                const newDueDate = new Date(newDueDateStr);
                                if (isNaN(newDueDate.getTime())) {
                                    console.log("Invalid date. Update aborted.");
                                    break;
                                }
                                else {
                                    updates.dueDate = newDueDate;
                                }
                            }
                            break;
                        }
                        default:
                            console.log("Invalid update option.");
                    }
                    const updatedTask = manager.updateTask(updateId, updates);
                    if (updatedTask) {
                        console.log("Updated Task:", updatedTask);
                    }
                    else {
                        console.log(`Task with ID ${updateId} not found.`);
                    }
                    break;
                }
                case "3": {
                    const removeIdStr = yield askQuestion("Enter task ID to remove: ");
                    const removeId = parseInt(removeIdStr);
                    if (isNaN(removeId)) {
                        console.log("Invalid task ID.");
                        break;
                    }
                    const removed = manager.removeTask(removeId);
                    if (removed) {
                        console.log(`Task with ID ${removeId} removed.`);
                    }
                    else {
                        console.log(`Task with ID ${removeId} not found.`);
                    }
                    break;
                }
                case "4": {
                    console.log("\n--- Current Tasks ---");
                    const tasks = manager.listTasks();
                    if (tasks.length === 0) {
                        console.log("No tasks available.");
                    }
                    else {
                        tasks.forEach((task) => {
                            console.log(`ID: ${task.id} | Title: ${task.title} | Status: ${task.status} | Priority: ${task.priority} | Due: ${task.dueDate ? task.dueDate.toLocaleDateString() : "N/A"}`);
                        });
                    }
                    break;
                }
                case "5": {
                    console.log("Exiting Task Manager.");
                    rl.close();
                    return;
                }
                default:
                    console.log("Invalid option. Please try again.");
            }
        }
    });
}
// ---------------------------
// Main Function
// ---------------------------
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const manager = new TaskManager();
        console.log("Welcome to the Advanced Task Manager CLI!");
        yield interactiveMenu(manager);
    });
}
main().catch((err) => console.error("Error in main:", err));
