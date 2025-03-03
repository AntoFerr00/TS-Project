"use strict";
/**
 * Advanced Task Manager CLI Application
 *
 * This project demonstrates advanced TypeScript features:
 * - Enums for TaskStatus and TaskPriority.
 * - Interfaces for Task and Repository.
 * - An abstract class with a generic in-memory repository.
 * - A custom method decorator for logging.
 * - A TaskManager class that uses the repository.
 * - Discriminated unions for CLI command processing.
 * - Async/await for simulating async operations.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
        const index = this.items.findIndex(item => item.id === id);
        if (index === -1)
            return undefined;
        this.items[index] = Object.assign(Object.assign({}, this.items[index]), updatedItem);
        return this.items[index];
    }
    remove(id) {
        const initialLength = this.items.length;
        this.items = this.items.filter(item => item.id !== id);
        return this.items.length < initialLength;
    }
    getById(id) {
        return this.items.find(item => item.id === id);
    }
    getAll() {
        return this.items;
    }
}
// ---------------------------
// Task Repository
// ---------------------------
class TaskRepository extends InMemoryRepository {
    // Additional method to filter tasks by priority
    getByPriority(priority) {
        return this.items.filter(task => task.priority === priority);
    }
    // Additional method to filter tasks due before a specific date
    getDueBefore(date) {
        return this.items.filter(task => task.dueDate !== undefined && task.dueDate < date);
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
            id: 0, // Will be set by repository
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
// Generic Helper Function
// ---------------------------
function logItems(items) {
    items.forEach((item) => console.log(item));
}
// ---------------------------
// Process Command Asynchronously
// ---------------------------
function processCommand(command, manager) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (command.type) {
            case "add": {
                const dueDate = command.dueDate ? new Date(command.dueDate) : undefined;
                const task = manager.addTask(command.title, command.description, command.priority, dueDate);
                console.log("Task added:", task);
                break;
            }
            case "update": {
                const updatedTask = manager.updateTask(command.id, command.updates);
                if (updatedTask) {
                    console.log("Task updated:", updatedTask);
                }
                else {
                    console.log(`Task with id ${command.id} not found.`);
                }
                break;
            }
            case "remove": {
                const removed = manager.removeTask(command.id);
                console.log(removed ? `Task ${command.id} removed.` : `Task ${command.id} not found.`);
                break;
            }
            case "list": {
                // Simulate async delay
                yield new Promise(resolve => setTimeout(resolve, 300));
                const tasks = manager.listTasks();
                console.log("Listing all tasks:");
                logItems(tasks);
                break;
            }
            case "listPriority": {
                yield new Promise(resolve => setTimeout(resolve, 300));
                const tasks = manager.listTasksByPriority(command.priority);
                console.log(`Listing tasks with priority "${command.priority}":`);
                logItems(tasks);
                break;
            }
            case "listDueBefore": {
                yield new Promise(resolve => setTimeout(resolve, 300));
                const date = new Date(command.date);
                const tasks = manager.listTasksDueBefore(date);
                console.log(`Listing tasks due before ${date.toLocaleString()}:`);
                logItems(tasks);
                break;
            }
            default: {
                const _exhaustiveCheck = command;
                throw new Error(`Unhandled command: ${_exhaustiveCheck}`);
            }
        }
    });
}
// ---------------------------
// Main Function to Simulate CLI Commands
// ---------------------------
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const manager = new TaskManager();
        const commands = [
            {
                type: "add",
                title: "Buy groceries",
                description: "Milk, Bread, Eggs",
                priority: TaskPriority.Medium,
                dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow
            },
            {
                type: "add",
                title: "Complete TypeScript project",
                description: "Implement advanced features",
                priority: TaskPriority.High,
                dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // Day after tomorrow
            },
            {
                type: "update",
                id: 2,
                updates: { status: TaskStatus.InProgress },
            },
            { type: "list" },
            { type: "listPriority", priority: TaskPriority.High },
            {
                type: "listDueBefore",
                date: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(), // 36 hours from now
            },
            {
                type: "remove",
                id: 1,
            },
            { type: "list" },
        ];
        for (const cmd of commands) {
            yield processCommand(cmd, manager);
        }
    });
}
main().catch(err => console.error("Error in main:", err));
