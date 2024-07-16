// Importing the required module
const Database = require("better-sqlite3");

// TaskDataDatabaseManager class
class TaskDataDatabaseManager {
  /**
   * Constructor for the TaskDataDatabaseManager class
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
      // Create the 'tasksData' table if it doesn't exist
      this.db
        .prepare(
          `
        CREATE TABLE IF NOT EXISTS tasksData (
          taskId TEXT,
          taskData TEXT
        );
      `
        )
        .run();
    }
  
  /**
   * Method to insert task data into the 'tasksData' table
   * @param {Object} task - The task to be inserted
   * @param {string} task.taskId - The ID of the task
   * @param {Object} task.taskData - The data of the task
   * @returns {number} The rowid of the last row inserted
   */
  insertTaskData({ taskId, taskData }) {
    const insert = this.db.prepare(`
      INSERT INTO tasksData (taskId, taskData)
      VALUES (?, ?);
    `);
    const info = insert.run(taskId, JSON.stringify(taskData));
    return info.lastInsertRowid;
  }

  /**
   * Method to update task data in the 'tasksData' table
   * @param {string} taskId - The ID of the task to be updated
   * @param {Object} taskData - The new data for the task
   * @returns {number} The number of rows updated
   */
  updateTaskData(taskId, { taskData }) {
    const update = this.db.prepare(`UPDATE tasksData SET taskData = ? WHERE taskId = ?;`);
    const info = update.run(JSON.stringify(taskData), taskId);
    return info.changes;
  }

  /**
   * Method to delete task data from the 'tasksData' table
   * @param {string} taskId - The ID of the task to be deleted
   * @returns {number} The number of rows deleted
   */
  deleteTaskData(taskId) {
    const deleteStmt = this.db.prepare("DELETE FROM tasksData WHERE taskId = ?");
    const info = deleteStmt.run(taskId);
    return info.changes;
  }

  /**
   * Method to get task data from the 'tasksData' table
   * @param {string} taskId - The ID of the task to get data for
   * @returns {Object|null} The task data, or null if not found
   */
  getTaskData(taskId) {
    // const task = this.db.prepare("SELECT * FROM tasksData WHERE taskId = ?").get(taskId);
    const query = this.db.prepare("SELECT * FROM tasksData WHERE taskId = ?");
    console.log("query: ", query);
    const tasks = query.all(taskId);
    console.log("taskId: ", tasks);
    return tasks;
  }

  /**
   * Method to get all task data from the 'tasksData' table
   * @returns {Array} All task data
   */
  getAllTaskData() {
    const tasks = this.db.prepare("SELECT * FROM tasksData").all();
    return tasks;
  }

  /**
   * Method to close the database connection
   */
  close() {
    this.db.close();
  }
}

// Exporting the TaskDataDatabaseManager class
export default TaskDataDatabaseManager;
