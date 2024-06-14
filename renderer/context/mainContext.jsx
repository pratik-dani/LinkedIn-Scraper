import React, { createContext, useContext, useState, useEffect } from "react";

// Create a context for managing the main state
const MainContext = createContext();

// Provider component to wrap the application and provide context values
const MainProvider = ({ children }) => {
  // State variables to manage tasks, accounts, and pagination
  const [tasks, setTasks] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [page, setPage] = useState(null);

  // Effect hook to update tasks and accounts when the component mounts or page changes
  useEffect(() => {
    updateTasks();
    updateAccounts();
    
    // Listener for task progress updates
    window.ipc.on("task-progress", () => {
      updateTasks();
    });
  }, [page]);

  /**
   * Update the current page and trigger a re-render
   * 
   * @param {number} newPage - The new page number to set
   */
  const updatePage = (newPage) => {
    setPage(newPage);
  };

  /**
   * Add a new task by sending data to the main process
   * 
   * @param {Object} data - The task data to add
   */
  const addTask = async (data) => {
    window.ipc.send("add-task", data);
    updateTasks();
  };

  /**
   * Add a new account by sending a cookie to the main process
   * 
   * @param {string} cookie - The cookie string for the account
   */
  const addAccount = async (cookie) => {
    window.ipc.send("add-account", { cookie });
  };

  /**
   * Handle the notification for account deletion
   */
  const handleDeleteNotification = () => {
    window.ipc.on("account-deleted", () => {
      updateAccounts();
      enqueueSnackbar("Account deleted", { variant: "success" });
    });
  };

  /**
   * Handle the deletion of an account by sending the account ID to the main process
   * 
   * @param {string} id - The ID of the account to delete
   */
  const handleAccountDelete = async (id) => {
    window.ipc.send("delete-account", { id });
    handleDeleteNotification();
    updateAccounts();
  };

  /**
   * Handle the deletion of a task by sending the task ID to the main process
   * 
   * @param {string} taskId - The ID of the task to delete
   */
  const handleTaskDelete = async (taskId) => {
    window.ipc.send("delete-task", { taskId });
    updateTasks();
  };

  /**
   * Update the list of accounts by requesting data from the main process
   */
  const updateAccounts = async () => {
    console.log("page", page);
    window.ipc.send("get-accounts");
    window.ipc.on("accounts", ({ data }) => {
      setAccounts(data);
    });
  };

  /**
   * Update the list of tasks by requesting data from the main process
   */
  const updateTasks = async () => {
    if (!page) return;
    window.ipc.send("get-tasks", { page });
    window.ipc.on("tasks", ({ data }) => {
      setTasks(data);
    });
  };

  // Provide context values to the children components
  return (
    <MainContext.Provider
      value={{
        tasks,
        accounts,
        updatePage,
        addTask,
        addAccount,
        handleAccountDelete,
        handleTaskDelete,
        updateTasks,
        updateAccounts,
        handleDeleteNotification,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export { MainContext, MainProvider };
