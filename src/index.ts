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
      id: 0, // will be assigned by repository
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
// Interactive CLI using readline
// ---------------------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

// ---------------------------
// Interactive Menu Function
// ---------------------------
async function interactiveMenu(manager: TaskManager): Promise<void> {
  while (true) {
    console.log("\n--- Task Manager Menu ---");
    console.log("1. Add Task");
    console.log("2. Update Task");
    console.log("3. Remove Task");
    console.log("4. List Tasks");
    console.log("5. Exit");
    const choice = await askQuestion("Select an option: ");

    switch (choice.trim()) {
      case "1": {
        const title = await askQuestion("Enter task title: ");
        const description = await askQuestion("Enter task description: ");
        const priorityStr = await askQuestion(
          "Enter task priority (Low, Medium, High): "
        );
        let priority: TaskPriority;
        if (priorityStr.toLowerCase() === "low") {
          priority = TaskPriority.Low;
        } else if (priorityStr.toLowerCase() === "high") {
          priority = TaskPriority.High;
        } else {
          priority = TaskPriority.Medium;
        }
        const dueDateStr = await askQuestion(
          "Enter due date (YYYY-MM-DD) or leave blank: "
        );
        let dueDate: Date | undefined = undefined;
        if (dueDateStr.trim() !== "") {
          dueDate = new Date(dueDateStr);
          if (isNaN(dueDate.getTime())) {
            console.log("Invalid date. Due date not set.");
            dueDate = undefined;
          }
        }
        const newTask = manager.addTask(
          title,
          description,
          priority,
          dueDate
        );
        console.log("Added Task:", newTask);
        break;
      }
      case "2": {
        const updateIdStr = await askQuestion("Enter task ID to update: ");
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
        const updateChoice = await askQuestion("Select an option: ");
        let updates: Partial<Task> = {};
        switch (updateChoice.trim()) {
          case "1": {
            const newTitle = await askQuestion("Enter new title: ");
            updates.title = newTitle;
            break;
          }
          case "2": {
            const newDesc = await askQuestion("Enter new description: ");
            updates.description = newDesc;
            break;
          }
          case "3": {
            const newStatusStr = await askQuestion(
              "Enter new status (Pending, In Progress, Completed): "
            );
            let newStatus: TaskStatus;
            if (newStatusStr.toLowerCase() === "pending") {
              newStatus = TaskStatus.Pending;
            } else if (
              newStatusStr.toLowerCase() === "in progress" ||
              newStatusStr.toLowerCase() === "inprogress"
            ) {
              newStatus = TaskStatus.InProgress;
            } else if (newStatusStr.toLowerCase() === "completed") {
              newStatus = TaskStatus.Completed;
            } else {
              console.log("Invalid status. Update aborted.");
              break;
            }
            updates.status = newStatus;
            break;
          }
          case "4": {
            const newPriorityStr = await askQuestion(
              "Enter new priority (Low, Medium, High): "
            );
            let newPriority: TaskPriority;
            if (newPriorityStr.toLowerCase() === "low") {
              newPriority = TaskPriority.Low;
            } else if (newPriorityStr.toLowerCase() === "high") {
              newPriority = TaskPriority.High;
            } else if (newPriorityStr.toLowerCase() === "medium") {
              newPriority = TaskPriority.Medium;
            } else {
              console.log("Invalid priority. Update aborted.");
              break;
            }
            updates.priority = newPriority;
            break;
          }
          case "5": {
            const newDueDateStr = await askQuestion(
              "Enter new due date (YYYY-MM-DD) or leave blank to remove: "
            );
            if (newDueDateStr.trim() === "") {
              updates.dueDate = undefined;
            } else {
              const newDueDate = new Date(newDueDateStr);
              if (isNaN(newDueDate.getTime())) {
                console.log("Invalid date. Update aborted.");
                break;
              } else {
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
        } else {
          console.log(`Task with ID ${updateId} not found.`);
        }
        break;
      }
      case "3": {
        const removeIdStr = await askQuestion("Enter task ID to remove: ");
        const removeId = parseInt(removeIdStr);
        if (isNaN(removeId)) {
          console.log("Invalid task ID.");
          break;
        }
        const removed = manager.removeTask(removeId);
        if (removed) {
          console.log(`Task with ID ${removeId} removed.`);
        } else {
          console.log(`Task with ID ${removeId} not found.`);
        }
        break;
      }
      case "4": {
        console.log("\n--- Current Tasks ---");
        const tasks = manager.listTasks();
        if (tasks.length === 0) {
          console.log("No tasks available.");
        } else {
          tasks.forEach((task) => {
            console.log(
              `ID: ${task.id} | Title: ${task.title} | Status: ${task.status} | Priority: ${task.priority} | Due: ${
                task.dueDate ? task.dueDate.toLocaleDateString() : "N/A"
              }`
            );
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
}

// ---------------------------
// Main Function
// ---------------------------
async function main() {
  const manager = new TaskManager();
  console.log("Welcome to the Advanced Task Manager CLI!");
  await interactiveMenu(manager);
}

main().catch((err) => console.error("Error in main:", err));
