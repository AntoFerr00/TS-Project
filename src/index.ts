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
        id: 0,
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
  // DOM Interaction
  // ---------------------------
  document.addEventListener("DOMContentLoaded", () => {
    const manager = new TaskManager();
  
    const taskForm = document.getElementById("taskForm") as HTMLFormElement;
    const tasksList = document.getElementById("tasksList") as HTMLUListElement;
  
    // Renders the current tasks in the DOM using Bootstrap list groups
    function renderTasks(): void {
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
          <small>Status: ${task.status} | Priority: ${task.priority} | Due: ${
          task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"
        }</small>
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
      const titleInput = document.getElementById("title") as HTMLInputElement;
      const descriptionInput = document.getElementById("description") as HTMLInputElement;
      const prioritySelect = document.getElementById("priority") as HTMLSelectElement;
      const dueDateInput = document.getElementById("dueDate") as HTMLInputElement;
  
      const title = titleInput.value.trim();
      const description = descriptionInput.value.trim();
      const priority = prioritySelect.value as TaskPriority;
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
  