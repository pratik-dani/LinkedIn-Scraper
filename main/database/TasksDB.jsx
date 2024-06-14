// Importing the required module
const Database = require("better-sqlite3");

// TasksDatabaseManager class
class TasksDatabaseManager {
  /**
   * Constructor for the TasksDatabaseManager class
   * @param {string} databaseFile - The path to the SQLite database file
   */
  constructor(databaseFile) {
    // Initialize the database connection
    this.db = new Database(databaseFile);
    // Initialize the database schema
    this.initialize();
  }

  /**
   * Method to initialize the database schema
   */
  initialize() {
    // Create the 'tasks' table if it doesn't exist
    this.db
      .prepare(
        `
      CREATE TABLE IF NOT EXISTS tasks (
        taskId TEXT TEXT PRIMARY KEY,
        taskName TEXT,
        taskStartTime TEXT,
        taskCompletedTime TEXT,
        taskType TEXT,
        taskProgress INTEGER,
        taskLogs TEXT,
        taskResult TEXT,
        taskInput TEXT,
        taskAccount TEXT
      );
    `
      )
      .run();
  }

  /**
   * Method to insert a task into the 'tasks' table
   * @param {Object} task - The task to be inserted
   * @returns {number} The rowid of the last row inserted
   */
  insertTask({
    taskId,
    taskName,
    taskStartTime,
    taskCompletedTime,
    taskType,
    taskProgress,
    taskLogs,
    taskResult,
    taskInput,
    taskAccount,
  }) {
    const insert = this.db.prepare(`
      INSERT INTO tasks (taskId, taskName, taskStartTime, taskCompletedTime, taskType, taskProgress, taskLogs, taskResult, taskInput, taskAccount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);
    const info = insert.run(
      taskId,
      taskName,
      taskStartTime,
      taskCompletedTime,
      taskType,
      taskProgress,
      taskLogs,
      taskResult,
      taskInput,
      taskAccount
    );
    return info.lastInsertRowid;
  }

  /**
   * Method to update a task in the 'tasks' table
   * @param {string} taskId - The id of the task to be updated
   * @param {Object} task - The new data for the task
   * @returns {number} The number of rows updated
   */
  updateTask(
    taskId,
    {
      taskName,
      taskStartTime,
      taskCompletedTime,
      taskType,
      taskProgress,
      taskLogs,
      taskResult,
      taskInput,
      taskAccount,
    }
  ) {
    const update = this.db.prepare(`
      UPDATE tasks
      SET taskName = ?, taskStartTime = ?, taskCompletedTime = ?, taskType = ?, taskProgress = ?, taskLogs = ?, taskResult = ?, taskInput = ?, taskAccount = ?
      WHERE taskId = ?;
    `);
    const info = update.run(
      taskName,
      taskStartTime,
      taskCompletedTime,
      taskType,
      taskProgress,
      taskLogs,
      taskResult,
      taskInput,
      taskAccount,
      taskId
    );
    return info.changes;
  }

  /**
   * Method to delete a task from the 'tasks' table
   * @param {string} taskId - The id of the task to be deleted
   * @returns {number} The number of rows deleted
   */
  deleteTask(taskId) {
    const deleteStmt = this.db.prepare("DELETE FROM tasks WHERE taskId = ?");
    const info = deleteStmt.run(taskId);
    return info.changes;
  }

  /**
   * Method to get a task from the 'tasks' table
   * @param {string} taskId - The id of the task to be retrieved
   * @returns {Object|null} The task with the specified id, or null if not found
   */
  getTask(taskId) {
    const task = this.db
      .prepare("SELECT * FROM tasks WHERE taskId = ?")
      .get(taskId);
    return task;
  }

  /**
   * Method to get all tasks from the 'tasks' table
   * @param {string} page - The type of tasks to be retrieved
   * @returns {Array} An array of tasks with the specified type
   */
  getAllTasks(page) {
    const query = `SELECT * FROM tasks WHERE taskType = ?;`
    const tasks = this.db.prepare(query).all(page);
    return tasks;
  }

  /**
   * Method to add a log to a task in the 'tasks' table
   * @param {string} taskId - The id of the task
   * @param {string} log - The log to be added
   * @returns {number} The number of rows updated
   */
  addTaskLog(taskId, log) {
    const task = this.getTask(taskId);
    if (!task) return null;

    const updatedLogs = (task.taskLogs ? task.taskLogs + "\n" : "") + log;
    const update = this.db.prepare(
      "UPDATE tasks SET taskLogs = ? WHERE taskId = ?"
    );
    const info = update.run(updatedLogs, taskId);
    return info.changes;
  }

  /**
   * Method to update the progress of a task in the 'tasks' table
   * @param {string} taskId - The id of the task
   * @param {number} progress - The new progress of the task
   * @returns {number} The number of rows updated
   */
  updateTaskProgress(taskId, progress) {
    const update = this.db.prepare(
      "UPDATE tasks SET taskProgress = ? WHERE taskId = ?"
    );
    const info = update.run(progress, taskId);
    return info.changes;
  }

  /**
   * Method to close the database connection
   */
  close() {
    this.db.close();
  }
}

// Export the TasksDatabaseManager class
export default TasksDatabaseManager;
