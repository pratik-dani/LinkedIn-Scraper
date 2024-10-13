// Importing the required module
const Database = require("better-sqlite3");

// DatabaseManager class
class DatabaseManager {
  /**
   * Constructor for the DatabaseManager class
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
    // Create the 'accounts' table if it doesn't exist
    this.db
      .prepare(
        `
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY,
        cookie TEXT,
        accountData TEXT,
        status TEXT,
        headers TEXT
      );
    `
      )
      .run();
  }

  /**
   * Method to insert data into the 'accounts' table
   * @param {Object} data - The data to be inserted
   * @param {string} data.cookie - The cookie associated with the account
   * @param {string} data.accountData - The account data
   * @param {string} data.status - The status of the account
   * @param {string} data.headers - The headers associated with the account
   * @returns {number|null} The rowid of the last row inserted, or null if insertion fails
   */
  insertData({ cookie, accountData, status, headers }) {
    try {
      // Prepare the INSERT statement
      const insert = this.db.prepare(`
          INSERT INTO accounts (cookie, accountData, status, headers)
          VALUES (?, ?, ?, ?);
        `);
      // Run the INSERT statement
      const info = insert.run(cookie, accountData, status, headers);
      // Return the rowid of the last row inserted
      return info.lastInsertRowid;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /**
   * Method to get all data from the 'accounts' table
   * @returns {Array} An array of all rows in the 'accounts' table
   */
  getData() {
    const accounts = this.db.prepare("SELECT * FROM accounts").all();
    return accounts;
  }

  /**
   * Method to get data from the 'accounts' table by id
   * @param {number} id - The id of the row to be retrieved
   * @returns {Object|null} The row with the specified id, or null if not found
   */
  getDataById(id) {
    const query = this.db.prepare("SELECT * FROM accounts WHERE id = ?");
    const accounts = query.get(id);
    return accounts;
  }

  /**
   * Method to delete data from the 'accounts' table by id
   * @param {number} id - The id of the row to be deleted
   * @returns {number} The number of rows deleted
   */
  deleteData(id) {
    const deleteStmt = this.db.prepare("DELETE FROM accounts WHERE id = ?");
    const info = deleteStmt.run(id);
    return info.changes;
  }

  /**
   * Method to update the status of an account in the 'accounts' table
   * @param {number} id - The id of the account to be updated
   * @param {string} status - The new status of the account
   * @returns {number} The number of rows updated
   */
  updateAccountStatus(id, status) {
    const updateStmt = this.db.prepare("UPDATE accounts SET status = ? WHERE id = ?");
    const info = updateStmt.run(status, id);
    return info.changes;
  }

  /**
   * Method to close the database connection
   */
  close() {
    this.db.close();
  }
}

// Export the DatabaseManager class
export default DatabaseManager;