// Import necessary modules from 'tough-cookie', './userAgents', './helpers', '../database/TaskDataDB', 'electron', and 'path'
const { CookieJar } = require("tough-cookie");
const { getUserAgent } = require("./userAgents");
import { createAxiosClient } from "./helpers";
import TaskDataDatabaseManager from "../database/TaskDataDB";
import { app } from "electron";
import path from "path";

// Checking if the environment is production
const isProd = process.env.NODE_ENV === "production";
let taskDataDb;

/**
 * Function to extract LinkedIn username from a given URL
 * @param {string} url - The LinkedIn profile URL
 * @returns {Promise<string|null>} - The extracted username or null if not found
 */
const extractLinkedInUsername = async (url) => {
  const regex = /https:\/\/(www\.)?linkedin\.com\/in\/([^/?]+)/;
  const match = url.match(regex);
  if (match && match[2]) {
    return match[2];
  }
  return null;
};

// Function to get the profile data from LinkedIn
const getProfileData = async (liUrl, initialClient, data) => {
  const username = await extractLinkedInUsername(liUrl);
  const baseUrl = `https://www.linkedin.com/voyager/api/identity/dash/profiles?q=memberIdentity&memberIdentity=${username}&decorationId=com.linkedin.voyager.dash.deco.identity.profile.FullProfileWithEntities-101&count=100`;
  const profileResponse = await initialClient.get(baseUrl);

  const {
    firstName,
    lastName,
    headline,
    summary,
    geoLocation,
    publicIdentifier,
    entityUrn,
    profilePositionGroups,
    location,
    industry,
  } = profileResponse.data.elements[0];

  const extractedData = {
    input: liUrl,
    taskId: data.taskId,
    firstName,
    lastName,
    headline,
    summary,
    username: publicIdentifier || "",
    salesNavUrl:
      `https://www.linkedin.com/sales/people/${entityUrn
        .split(":")
        .at(-1)},NAME_SEARCH` || "",
    countryCode: location?.countryCode || "",
    country: geoLocation?.geo?.country?.defaultLocalizedName || "",
    locationName: geoLocation?.geo?.defaultLocalizedName || "",
    industry: industry?.name || "",
  };

  profilePositionGroups.elements.slice(0, 1).map((element) => {
    element.profilePositionInPositionGroup.elements
      .slice(0, 1)
      .map((profile) => {
        let industryKey = profile.company?.industryUrns?.[0];
        extractedData.currentRole = profile.title || "";
        extractedData.currentCompany = profile.companyName || "";
        extractedData.currentCompanyLinkedInUrl = profile.company?.url || "";
        extractedData.currentCompanyIndustry =
          profile.company?.industry[industryKey]?.name || "";
        extractedData.currentCompanyLinkedInId =
          profile.company?.entityUrn.split(":").at(-1) || "";
        extractedData.currentCompanyEmployeeCountRange =
          profile.company?.employeeCountRange?.start === undefined
            ? `${profile.company?.employeeCountRange?.start}-${profile.company?.employeeCountRange?.end}`
            : "";
      });
  });

  return extractedData;
};

/**
 * Function to save the extracted data to the database
 * @param {object} data - The extracted profile data
 */
const saveData2Db = (data) => {
  if (isProd) {
    const path_ = app.getPath("documents");
    console.log(path_);
    const db_path = path.join(path_, "database.db");
    taskDataDb = new TaskDataDatabaseManager(db_path);
  } else {
    taskDataDb = new TaskDataDatabaseManager("database.db");
  }
  taskDataDb.insertTaskData({ taskId: data.taskId, taskData: data });
  taskDataDb.close();
};

/**
 * Function to pause execution for a specified duration
 * @param {number} ms - The duration in milliseconds
 * @returns {Promise<void>}
 */
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Function to get LinkedIn profiles data
 * @param {object} param - An object containing event, data, headers, and taskManager
 * @returns {Promise<void>}
 */
const GetProfiles = async ({ event, data, headers, tasksManager }) => {
  // Split the task input into individual URLs
  var urls = data.taskInput.split("\n");
  // Filter out any empty strings
  var urls = urls.filter((url) => url !== "");
  // Trim any leading or trailing whitespace from each URL
  var urls = urls.map((url) => url.trim());

  // Loop over each URL
  for (let i = 0; i < urls.length; i++) {
    // Get the current URL
    const url = urls[i];
    // Get a user agent string
    const userAgent = getUserAgent();
    // Set the User-Agent header
    headers["User-Agent"] = userAgent;
    // Create a new cookie jar
    const initialJar = new CookieJar();
    // Create a new Axios client with the headers and cookie jar
    const initialClient = createAxiosClient(headers, initialJar);
    try {
      // Get the profile data for the current URL
      const profileResponse = await getProfileData(url, initialClient, data);
      // Save the profile data to the database
      saveData2Db(profileResponse);
    } catch (error) {
      // If an error occurs, save the error message to the database
      saveData2Db({ input: url, taskId: data.taskId, error: error.message });
    }
    // Calculate the progress as a percentage
    let progress = ((i + 1) * 100) / urls.length;
    // Update the task progress
    tasksManager.updateTaskProgress(data.taskId, progress);
    // Send a task-progress event
    event.sender.send("task-progress");
    // Pause for 10 seconds
    await sleep(10000);
  }
};

// Export the GetProfiles function as the default export
export default GetProfiles;