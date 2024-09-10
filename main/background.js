import path from "path";
import { app, globalShortcut, ipcMain, Notification, shell } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import verifySession from "./linkedin/verifyCookie";
import AccountsDatabaseManager from "./database/AccountsDB";
import TasksDatabaseManager from "./database/TasksDB";
import TaskDataDatabaseManager from "./database/TaskDataDB";
import GetProfiles from "./linkedin/peopleProfile";
import GetCompanyProfiles from "./linkedin/companyProfile";
import { parse } from "json2csv";
import uuidv4 from "../renderer/utils/uuidv4";
import GetPostsData from "./linkedin/posts";
import GetSalesNavigatorData from "./linkedin/salesNavigator";

// Determine if the application is running in production mode
const isProd = process.env.NODE_ENV === "production";

// Serve static files from the "app" directory in production mode
if (isProd) {
  serve({ directory: "app" });
} else {
  // Set the user data path for development mode
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

// Database managers
let accountsManager;
let tasksManager;
let taskDataDb;

// Main function to initialize the application
(async () => {
  // Wait for the Electron app to be ready
  await app.whenReady();

  // Create the main application window
  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  // Load the appropriate URL based on the environment
  if (isProd) {
    const path_ = app.getPath("documents");
    const db_path = path.join(path_, "database.db");
    accountsManager = new AccountsDatabaseManager(db_path);
    tasksManager = new TasksDatabaseManager(db_path);
    taskDataDb = new TaskDataDatabaseManager(db_path);
    await mainWindow.loadURL("app://./");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/`);
    accountsManager = new AccountsDatabaseManager("database.db");
    tasksManager = new TasksDatabaseManager("database.db");
    taskDataDb = new TaskDataDatabaseManager("database.db");
    // Uncomment to open the DevTools in development mode
    // mainWindow.webContents.openDevTools();
  }
})();

// Register global shortcuts in production mode
if (isProd) {
  app.on("ready", () => {
    // Register dummy shortcut listeners to intercept and do nothing
    globalShortcut.register("CommandOrControl+Shift+I", () => {});
    globalShortcut.register("CommandOrControl+Shift+J", () => {});
    globalShortcut.register("CommandOrControl+Option+I", () => {});
  });
}

// Quit the application when all windows are closed
app.on("window-all-closed", () => {
  app.quit();
});

// Close database connections on app quit
app.on("quit", () => {
  if (accountsManager || tasksManager) {
    accountsManager.close();
    tasksManager.close();
  }
});

// IPC handler for adding a new task
ipcMain.on("add-task", async (event, data) => {
  const taskId = uuidv4();
  const taskData = {
    taskId,
    taskName: data.taskName,
    taskStartTime: new Date().toISOString(),
    taskCompletedTime: null,
    taskType: data.taskType,
    taskProgress: 0,
    taskLogs: "",
    taskResult: "",
    // taskInput: data.profiles,
    taskAccount: data.account,
  };

  // Insert task into the database
  const id_ = tasksManager.insertTask(taskData);

  // Retrieve account data by ID
  const accountData = accountsManager.getDataById(data.account);

  // Execute the appropriate task based on task type
  if (data.taskType === "linkedin.profiles") {
    taskData.taskInput = data.profiles;
    await GetProfiles({
      event,
      data: taskData,
      headers: JSON.parse(accountData.headers),
      tasksManager,
    });
  } else if (data.taskType === "linkedin.company") {
    taskData.taskInput = data.profiles;
    await GetCompanyProfiles({
      event,
      data: taskData,
      headers: JSON.parse(accountData.headers),
      tasksManager,
    });
  }
  else if (data.taskType === "linkedin.posts") {
    taskData.taskInput = data.postUrl;
    console.log('label', taskData);
    GetPostsData({
      event,
      data: taskData,
      headers: JSON.parse(accountData.headers),
      tasksManager,
    })
  }
  else if (data.taskType === "linkedin.salesnavigator") {
    taskData.taskInput = data.postUrl;
    console.log('label', taskData);
    GetSalesNavigatorData({
      event,
      data: taskData,
      headers: JSON.parse(accountData.headers),
      tasksManager,
    })
  }


  // Reply with the task ID
  event.reply("add-task", { id: taskId });
});

// IPC handler for retrieving tasks
ipcMain.on("get-tasks", async (event, { page }) => {
  try {
    const resp = tasksManager.getAllTasks(page);
    event.reply("tasks", { data: resp });
  } catch (error) {
    console.error(error);
  }
});

// IPC handler for deleting a task
ipcMain.on("delete-task", async (event, data) => {
  tasksManager.deleteTask(data.taskId);
});

// IPC handler for adding a new account
ipcMain.on("add-account", async (event, { cookie }) => {
  try {
    const [status, resp, headers] = await verifySession(cookie);
    if (status) {
      const accountsData = {
        cookie: cookie,
        accountData: JSON.stringify(resp),
        status: 1,
        headers: JSON.stringify(headers),
      };
      accountsManager.insertData(accountsData);
      event.reply("add-account", { message: resp, status });
    } else {
      event.reply("add-account", { message: "Session verification failed", status });
    }
  } catch (error) {
    console.error("Error adding account:", error);
    event.reply("add-account", { message: "Error adding account", status: false });
  }
});

// IPC handler for retrieving accounts
ipcMain.on("get-accounts", async (event, data) => {
  try {
    const resp = accountsManager.getData();
    const updatedResp = resp.map((e) => {
      const d = {};
      d.cookie = e.cookie;
      d.name = `${JSON.parse(e.accountData).miniProfile.firstName} ${JSON.parse(e.accountData).miniProfile.lastName}`;
      d.id = e.id;
      return d;
    });
    event.reply("accounts", { data: updatedResp });
  } catch (error) {
    console.error(error);
  }
});

// IPC handler for deleting an account
ipcMain.on("delete-account", (event, { id }) => {
  accountsManager.deleteData(id);
  event.reply("account-deleted");
});

// IPC handler for showing a notification
ipcMain.on("show-notification", (event, { title, body }) => {
  new Notification({ title, body }).show();
});

// IPC handler for opening an external link
ipcMain.on("open-link", (event, url) => {
  shell.openExternal(url);
});

// IPC handler for downloading task results as CSV
ipcMain.on("download-results", (event, { taskId, filename }) => {
  const taskData = taskDataDb.getTaskData(taskId);
  const data = taskData.map((e) => JSON.parse(e.taskData));
  const csv = parse(data);
  event.reply("csv-results", { csv, filename });
});
