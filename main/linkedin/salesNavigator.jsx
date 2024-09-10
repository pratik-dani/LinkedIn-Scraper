// Import necessary modules
const { CookieJar } = require("tough-cookie");
const { getUserAgent } = require("./userAgents");
const { createAxiosClient } = require("./helpers");
import TaskDataDatabaseManager from "../database/TaskDataDB";
const { app } = require("electron");
const path = require("path");
const { parse } = require("url");

// Checking if the environment is production
const isProd = process.env.NODE_ENV === "production";
let taskDataDb;

// Function to fetch data from LinkedIn Sales API
const getSalesApiData = async (url, client, params) => {
  try {
    // Make the API request using the axios client
    const response = await client.get(url, { params });

    // Assuming the response comes in a structure with elements, adjust the parsing accordingly
    const elements = response.data.elements;

    // Extract the required fields from the response
    const leadData = elements.map((item) => {
      const region = item.region ? item.region.text : "Unknown";
      const keyword = params.keywords || "Unknown";

      return {
        name: item.name.text || "N/A",
        headline: item.occupation.text || "N/A",
        location: region,
        keyword: keyword,
        profileUrl: item.navigationContext.actionTarget || "",
        salesNavId: item.actorUrn ? item.actorUrn.split(":").pop() : "",
      };
    });

    return leadData;
  } catch (error) {
    console.error("Error fetching Sales API data:", error.message);
    throw new Error("Failed to fetch data from Sales API.");
  }
};

// Function to save the data to the database
const saveData2Db = async (data, taskId) => {
  if (isProd) {
    const path_ = app.getPath("documents");
    const db_path = path.join(path_, "database.db");
    taskDataDb = new TaskDataDatabaseManager(db_path);
  } else {
    taskDataDb = new TaskDataDatabaseManager("database.db");
  }

  for (const d of data) {
    await taskDataDb.insertTaskData({ taskId: taskId, taskData: d });
  }

  await taskDataDb.close();
};

// Main function to fetch and save sales leads data
const GetSalesNavigatorData = async ({ event, data, headers, tasksManager }) => {
  // Example Sales API URL
  const salesApiUrl = `https://www.linkedin.com/sales-api/salesApiLeadSearch`;

  // Example query params
  const params = {
    q: "searchQuery",
    query: JSON.stringify({
      spellCorrectionEnabled: true,
      recentSearchParam: {
        id: "3192970769",
        doLogHistory: true,
      },
      filters: [
        {
          type: "REGION",
          values: [{ id: "101282230", text: "Deutschland", selectionType: "INCLUDED" }],
        },
        {
          type: "POSTED_ON_LINKEDIN",
          values: [{ id: "RPOL", text: "Haben etwas auf LinkedIn gepostet", selectionType: "INCLUDED" }],
        },
      ],
      keywords: "fitness coach",
    }),
    start: 275,
    count: 25,
    trackingParam: JSON.stringify({
      sessionId: "Fdb/8Rk3QaeVRD3lkbGRCg==",
    }),
    decorationId: "com.linkedin.sales.deco.desktop.searchv2.LeadSearchResult-14",
  };

  // Set up the axios client with the appropriate headers
  const userAgent = getUserAgent();
  headers["User-Agent"] = userAgent;
  const client = createAxiosClient(headers);

  try {
    // Fetch sales leads data from LinkedIn Sales API
    const salesLeadsData = await getSalesApiData(salesApiUrl, client, params);

    // Save the sales leads data to the database
    saveData2Db(salesLeadsData, data.taskId);
  } catch (error) {
    // Handle and log the error
    saveData2Db({ input: salesApiUrl, taskId: data.taskId, error: error.message }, data.taskId);
  }

  // Update task progress
  tasksManager.updateTaskProgress(data.taskId, 100);
  event.sender.send("task-progress");
};

export default GetSalesNavigatorData;
