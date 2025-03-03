import * as readline from "readline";

// ---------------------------
// Decorator: Log Method Calls
// ---------------------------
function logExecution(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]): any {
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
abstract class InMemoryRepository<T extends { id: number }>
  implements Repository<T> {
  protected items: T[] = [];
  protected nextId: number = 1;

  add(item: T): T {
    item.id = this.nextId++;
    this.items.push(item);
    return item;
  }

  update(id: number, updatedItem: Partial<T>): T | undefined {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    this.items[index] = { ...this.items[index], ...updatedItem };
    return this.items[index];
  }

  remove(id: number): boolean {
    const initialLength = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);
    return this.items.length < initialLength;
  }

  getById(id: number): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  getAll(): T[] {
    return this.items;
  }
}

// ---------------------------
// Task Repository
// ---------------------------
class TaskRepository extends InMemoryRepository<Task> {
  getByPriority(priority: TaskPriority): Task[] {
    return this.items.filter((task) => task.priority === priority);
  }

  getDueBefore(date: Date): Task[] {
    return this.items.filter(
      (task) => task.dueDate !== undefined && task.dueDate < date
    );
  }
}

// ---------------------------
// Task Manager Class
// ---------------------------
class TaskManager {
  private repository: TaskRepository = new TaskRepository();

  @logExecution
  addTask(
    title: string,
    description: string,
    priority: TaskPriority,
    dueDate?: Date
  ): Task {
    const task: Task = {
      id: 0, // Will be overridden in repository.add
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
}

// ---------------------------
// Command Line Interface Setup
// ---------------------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

// ---------------------------
// Main CLI Application Loop
// ---------------------------
async function main() {
  const manager = new TaskManager();
  let exit = false;

  while (!exit) {
    console.log("\nTask Manager Menu:");
    console.log("1. Add Task");
    console.log("2. Update Task");
    console.log("3. Remove Task");
    console.log("4. List Tasks");
    console.log("5. Exit");

    const choice = await question("Choose an option: ");

    switch (choice.trim()) {
      case "1": {
        const title = await question("Enter task title: ");
        if (title.trim() === "") {
          console.log("Title is required.");
          break;
        }
        const description = await question("Enter task description: ");
        const priorityInput = await question(
          "Enter task priority (Low, Medium, High): "
        );
        let priority: TaskPriority;
        if (priorityInput.toLowerCase() === "low") {
          priority = TaskPriority.Low;
        } else if (priorityInput.toLowerCase() === "high") {
          priority = TaskPriority.High;
        } else {
          priority = TaskPriority.Medium;
        }
        const dueDateInput = await question(
          "Enter due date (YYYY-MM-DD) or leave blank: "
        );
        let dueDate: Date | undefined = undefined;
        if (dueDateInput.trim() !== "") {
          const parsedDate = new Date(dueDateInput);
          if (!isNaN(parsedDate.getTime())) {
            dueDate = parsedDate;
          } else {
            console.log("Invalid date format. Due date will be ignored.");
          }
        }
        const task = manager.addTask(
          title.trim(),
          description.trim(),
          priority,
          dueDate
        );
        console.log("Task added:", task);
        break;
      }
      case "2": {
        const idStr = await question("Enter task ID to update: ");
        const id = parseInt(idStr);
        if (isNaN(id)) {
          console.log("Invalid task ID.");
          break;
        }
        const newTitle = await question(
          "Enter new title (leave blank to keep unchanged): "
        );
        const newDescription = await question(
          "Enter new description (leave blank to keep unchanged): "
        );
        const newPriorityInput = await question(
          "Enter new priority (Low, Medium, High) (leave blank to keep unchanged): "
        );
        const newDueDateInput = await question(
          "Enter new due date (YYYY-MM-DD) (leave blank to keep unchanged): "
        );
        const updates: Partial<Task> = {};
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
          } else if (priorityVal === "high") {
            updates.priority = TaskPriority.High;
          } else if (priorityVal === "medium") {
            updates.priority = TaskPriority.Medium;
          }
        }
        if (newDueDateInput.trim() !== "") {
          const parsedDate = new Date(newDueDateInput);
          if (!isNaN(parsedDate.getTime())) {
            updates.dueDate = parsedDate;
          } else {
            console.log("Invalid date format. Due date will be unchanged.");
          }
        }
        const updatedTask = manager.updateTask(id, updates);
        if (updatedTask) {
          console.log("Task updated:", updatedTask);
        } else {
          console.log("Task not found.");
        }
        break;
      }
      case "3": {
        const idStr = await question("Enter task ID to remove: ");
        const id = parseInt(idStr);
        if (isNaN(id)) {
          console.log("Invalid task ID.");
          break;
        }
        const removed = manager.removeTask(id);
        if (removed) {
          console.log(`Task ${id} removed.`);
        } else {
          console.log("Task not found.");
        }
        break;
      }
      case "4": {
        const tasks = manager.listTasks();
        if (tasks.length === 0) {
          console.log("No tasks available.");
        } else {
          console.log("Current tasks:");
          tasks.forEach((task) => {
            console.log(
              `ID: ${task.id}, Title: ${task.title}, Description: ${
                task.description || "No description"
              }, Status: ${task.status}, Priority: ${
                task.priority
              }, Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}`
            );
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
}

main();
