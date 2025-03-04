# Task Manager Application

This project is a simple Task Manager built with TypeScript. It demonstrates how to manage tasks (create, update, remove, and list) using an in-memory repository pattern and leverages decorators to log method calls. The core functionality is designed to work via the command line using Node.js.

## Features

- **Task Management:**  
  Add, update, remove, and list tasks with properties such as title, description, status, priority, and due date.

- **Logging Decorators:**  
  Uses a custom decorator to log method calls and results, which aids in debugging and understanding the flow of data.

- **In-Memory Repository:**  
  Implements a generic repository pattern to manage tasks without a database.

- **Command-Line interface:** Uses Node.js and the `readline` module for interactive CLI management.


## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.
- [npm](https://www.npmjs.com/) (comes with Node.js) for dependency management.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AntoFerr00/TS-Project.git
   cd your-repo
   ```

2. **Install dependencies:**
   ```bash
    npm install
    ```

3. **Build the project:**
   ```bash
   npm run build
    ```

4. **Run the CLI Application:**
   ```bash
   node dist/index.js
    ```

### License

This project is licensed under the MIT License.

### Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have any suggestions or improvements.