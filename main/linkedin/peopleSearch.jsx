/**
 * LinkedIn Search Parser Module
 * This module handles parsing and storing LinkedIn search results using Electron
 * 
 * Key features:
 * - Parses LinkedIn search URLs and converts them to API queries
 * - Handles pagination of search results
 * - Stores results in a local database
 * - Manages session cookies and authentication
 * - Tracks task progress and handles errors
 */

// Essential dependencies for HTTP requests, cookie management, and file system operations
const { CookieJar } = require("tough-cookie");
const { getUserAgent } = require("./userAgents");
import { createAxiosClient } from "./helpers";
import TaskDataDatabaseManager from "../database/TaskDataDB";
import AccountsDatabaseManager from "../database/AccountsDB";
import { app } from "electron";
import path from "path";

// Environment and configuration setup
const isProd = process.env.NODE_ENV === "production";
const ACCOUNT_STATUS_EXPIRED = 0;

// Database initialization
let taskDataDb;
let accountsManager;
let db_path;

// Set database path based on environment
if (isProd) {
  let path_ = app.getPath("documents");
  db_path = path.join(path_, "database.db");
} else {
  db_path = "database.db";
}

// Initialize database managers
taskDataDb = new TaskDataDatabaseManager(db_path);
accountsManager = new AccountsDatabaseManager(db_path);

/**
 * Saves extracted LinkedIn profile data to the database
 * Handles both single entries and arrays of data
 * @param {object|array} data - Profile data to be saved
 */
const saveData2Db = (data) => {
  if (Array.isArray(data)) {
    for (let d of data) {
      taskDataDb.insertTaskData({ taskId: d.taskId, taskData: d });
    }
    return;
  } else {
    taskDataDb.insertTaskData({ taskId: data.taskId, taskData: data });
  }
};

/**
 * Utility function to pause execution
 * Used for rate limiting and preventing aggressive scraping
 * @param {number} ms - Milliseconds to pause
 */
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Fetches and processes search results from LinkedIn's API
 * Extracts relevant profile information from the response
 * @param {string} url - API endpoint URL
 * @param {string} searchUrl - Original search URL
 * @param {object} initialClient - Axios client instance
 * @param {object} data - Task data containing taskId
 * @returns {array} Array of extracted profile data
 */
const getSearchResults = async (url, searchUrl, initialClient, data) => {
  const searchResponse = await initialClient.get(url);
  
  // Filter response to get only entries with tracking info
  const responseJsonData = searchResponse.data.included.filter((s) => "entityCustomTrackingInfo" in s);
  
  // Extract relevant profile information
  const extractedData = responseJsonData.map((s) => {
    return {
      input: searchUrl,
      taskId: data.taskId,
      name: s.title.text,
      headline: s.primarySubtitle.text,
      location: s.secondarySubtitle.text,
      linkedinUrl: s.navigationUrl,
    };
  });
  return extractedData;
};

/**
 * Main parser function for LinkedIn search results
 * Handles pagination, API queries, and error management
 * @param {object} params - Contains event, data, headers, and tasksManager
 */
const LinkedInSearchParser = async ({ event, data, headers, tasksManager }) => {
  console.log(headers);
  const searchUrl = data.taskInput;
  const count = 49; // Results per page
  
  // Parse and process the search URL parameters
  let base = decodeURIComponent(searchUrl).trim("/");
  base = base.split("/?")[base.split("/?").length - 1].split("&");
  
  // Define parameter types for query construction
  const stringFilters = [
    "title", "company", "firstName", "lastName",
    "schoolFreetext", "titleFreeText", "keywords"
  ];
  const listNotlist = ["position", "searchId"];
  const notRequired = ["origin", "sid"];

  // Construct the API query parameters
  let query = "";
  const origin = "FACETED_SEARCH";
  let queryParams = "queryParameters:(";

  // Process each parameter from the search URL
  for (let b of base) {
    let [k, v] = b.split("=");

    if (notRequired.includes(k)) continue;

    if (k === "keywords") {
      query += `keywords:${encodeURIComponent(v)}`;
      continue;
    }

    if (listNotlist.includes(k)) {
      v = String(v).split(",").map((s) => `${s}`);
      queryParams += `${k}:List(${v.join(",")})`;
      queryParams += ",";
      continue;
    }

    if (!stringFilters.includes(k)) {
      v = JSON.parse(v);
      if (Array.isArray(v)) {
        queryParams += `${k}:List(${v.join(",")})`;
      } else if (typeof v === "string") {
        queryParams += `${k}:List(${v})`;
      }
    } else {
      queryParams += `${k}:List(${encodeURIComponent(v)})`;
    }
    queryParams += ",";
  }

  // Finalize query construction
  queryParams += "resultType:List(PEOPLE)";
  queryParams = queryParams.replace(/,$/, "");
  queryParams += ")";
  const finalQuery = `(flagshipSearchIntent:SEARCH_SRP,${queryParams})`;
  const completeQuery = finalQuery;
  const decorationId = "com.linkedin.voyager.dash.deco.search.SearchClusterCollection-137";

  // Set API headers
  headers["accept"] = "application/vnd.linkedin.normalized+json+2.1";
  headers["x-restli-protocol-version"] = "2.0.0";

  // Handle pagination
  const totalPages = Math.ceil(data.totalCount / count);
  for (let i = 0; i < totalPages; i++) {
    var start = i * count;
    const url = `https://www.linkedin.com/voyager/api/search/dash/clusters?decorationId=${decorationId}&q=all&origin=${origin}&query=${completeQuery}&start=${start}&count=${count}`;

    // Setup request with fresh user agent and cookies
    const userAgent = getUserAgent();
    headers["User-Agent"] = userAgent;
    const initialJar = new CookieJar();
    const initialClient = createAxiosClient(headers, initialJar);
    
    let cookiesExpired = false;

    try {
      const searchData = await getSearchResults(url, searchUrl, initialClient, data);
      saveData2Db(searchData);
    } catch (error) {
      // Handle session expiration
      if (error.message === "Maximum number of redirects exceeded") {
        error.message = "Session expired. Update your session cookies and try again.";
        cookiesExpired = true;
      }
      saveData2Db({ input: url, taskId: data.taskId, error: error.message });
    }

    // Handle expired session
    if (cookiesExpired) {
      let progress = 100;
      tasksManager.updateTaskProgress(data.taskId, progress);
      accountsManager.updateAccountStatus(data.taskAccount, ACCOUNT_STATUS_EXPIRED);
      event.sender.send("task-progress");
      break;
    }

    // Update progress and implement rate limiting
    let progress = ((i + 1) * 100) / totalPages;
    tasksManager.updateTaskProgress(data.taskId, progress);
    event.sender.send("task-progress");
    await sleep(1000); // Rate limiting delay
  }
};

export default LinkedInSearchParser;