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

// ---------------------------
// Decorator: Log Method Calls
// ---------------------------
function logExecution(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
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
  enum TaskStatus {
    Pending = "Pending",
    InProgress = "In Progress",
    Completed = "Completed",
  }
  
  enum TaskPriority {
    Low = "Low",
    Medium = "Medium",
    High = "High",
  }
  
  // ---------------------------
  // Task Interface
  // ---------------------------
  interface Task {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: Date;
  }
  
  // ---------------------------
  // Generic Repository Interface
  // ---------------------------
  interface Repository<T> {
    add(item: T): T;
    update(id: number, updatedItem: Partial<T>): T | undefined;
    remove(id: number): boolean;
    getById(id: number): T | undefined;
    getAll(): T[];
  }
  
  // ---------------------------
  // Abstract In-Memory Repository
  // ---------------------------
  abstract class InMemoryRepository<T extends { id: number }> implements Repository<T> {
    protected items: T[] = [];
    protected nextId: number = 1;
  
    add(item: T): T {
      item.id = this.nextId++;
      this.items.push(item);
      return item;
    }
  
    update(id: number, updatedItem: Partial<T>): T | undefined {
      const index = this.items.findIndex(item => item.id === id);
      if (index === -1) return undefined;
      this.items[index] = { ...this.items[index], ...updatedItem };
      return this.items[index];
    }
  
    remove(id: number): boolean {
      const initialLength = this.items.length;
      this.items = this.items.filter(item => item.id !== id);
      return this.items.length < initialLength;
    }
  
    getById(id: number): T | undefined {
      return this.items.find(item => item.id === id);
    }
  
    getAll(): T[] {
      return this.items;
    }
  }
  
  // ---------------------------
  // Task Repository
  // ---------------------------
  class TaskRepository extends InMemoryRepository<Task> {
    // Additional method to filter tasks by priority
    getByPriority(priority: TaskPriority): Task[] {
      return this.items.filter(task => task.priority === priority);
    }
  
    // Additional method to filter tasks due before a specific date
    getDueBefore(date: Date): Task[] {
      return this.items.filter(task => task.dueDate !== undefined && task.dueDate < date);
    }
  }
  
  // ---------------------------
  // Task Manager Class
  // ---------------------------
  class TaskManager {
    private repository: TaskRepository = new TaskRepository();
  
    @logExecution
    addTask(title: string, description: string, priority: TaskPriority, dueDate?: Date): Task {
      const task: Task = {
        id: 0, // Will be set by repository
        title,
        description,
        status: TaskStatus.Pending,
        priority,
        dueDate,
      };
      return this.repository.add(task);
    }
  
    @logExecution
    updateTask(id: number, updates: Partial<Task>): Task | undefined {
      return this.repository.update(id, updates);
    }
  
    @logExecution
    removeTask(id: number): boolean {
      return this.repository.remove(id);
    }
  
    @logExecution
    listTasks(): Task[] {
      return this.repository.getAll();
    }
  
    @logExecution
    listTasksByPriority(priority: TaskPriority): Task[] {
      return this.repository.getByPriority(priority);
    }
  
    @logExecution
    listTasksDueBefore(date: Date): Task[] {
      return this.repository.getDueBefore(date);
    }
  }
  
  // ---------------------------
  // CLI Command Types using Discriminated Unions
  // ---------------------------
  interface AddCommand {
    type: "add";
    title: string;
    description: string;
    priority: TaskPriority;
    dueDate?: string; // ISO string
  }
  
  interface UpdateCommand {
    type: "update";
    id: number;
    updates: Partial<Task>;
  }
  
  interface RemoveCommand {
    type: "remove";
    id: number;
  }
  
  interface ListCommand {
    type: "list";
  }
  
  interface ListPriorityCommand {
    type: "listPriority";
    priority: TaskPriority;
  }
  
  interface ListDueBeforeCommand {
    type: "listDueBefore";
    date: string; // ISO date string
  }
  
  type Command = AddCommand | UpdateCommand | RemoveCommand | ListCommand | ListPriorityCommand | ListDueBeforeCommand;
  
  // ---------------------------
  // Generic Helper Function
  // ---------------------------
  function logItems<T>(items: T[]): void {
    items.forEach((item) => console.log(item));
  }
  
  // ---------------------------
  // Process Command Asynchronously
  // ---------------------------
  async function processCommand(command: Command, manager: TaskManager): Promise<void> {
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
        } else {
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
        await new Promise(resolve => setTimeout(resolve, 300));
        const tasks = manager.listTasks();
        console.log("Listing all tasks:");
        logItems(tasks);
        break;
      }
      case "listPriority": {
        await new Promise(resolve => setTimeout(resolve, 300));
        const tasks = manager.listTasksByPriority(command.priority);
        console.log(`Listing tasks with priority "${command.priority}":`);
        logItems(tasks);
        break;
      }
      case "listDueBefore": {
        await new Promise(resolve => setTimeout(resolve, 300));
        const date = new Date(command.date);
        const tasks = manager.listTasksDueBefore(date);
        console.log(`Listing tasks due before ${date.toLocaleString()}:`);
        logItems(tasks);
        break;
      }
      default: {
        const _exhaustiveCheck: never = command;
        throw new Error(`Unhandled command: ${_exhaustiveCheck}`);
      }
    }
  }
  
  // ---------------------------
  // Main Function to Simulate CLI Commands
  // ---------------------------
  async function main() {
    const manager = new TaskManager();
  
    const commands: Command[] = [
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
      await processCommand(cmd, manager);
    }
  }
  
  main().catch(err => console.error("Error in main:", err));
  