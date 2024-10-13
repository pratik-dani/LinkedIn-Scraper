// Import necessary modules
const { CookieJar } = require("tough-cookie");
const { getUserAgent } = require("./userAgents");
const { createAxiosClient } = require("./helpers");
import TaskDataDatabaseManager from "../database/TaskDataDB";
import AccountsDatabaseManager from "../database/AccountsDB";
const { app } = require("electron");
const path = require("path");

// Checking if the environment is production
const isProd = process.env.NODE_ENV === "production";
const ACCOUNT_STATUS_EXPIRED = 0;
let taskDataDb;
let accountsManager;
if (isProd) {
  let path_ = app.getPath("documents");
  console.log(path_);
  db_path = path.join(path_, "database.db");
} else {
  db_path = "database.db";
}
taskDataDb = new TaskDataDatabaseManager(db_path);
accountsManager = new AccountsDatabaseManager(db_path);


/**
 * Function to extract LinkedIn username from a given URL
 * @param {string} url - The LinkedIn URL of the company
 * @returns {Promise<string|null>} - The LinkedIn company username or null if not found
 */
const extractLinkedInUsername = async (url) => {
  const regex = /https:\/\/(www\.)?linkedin\.com\/company\/([^/?]+)/;
  const match = url.match(regex);
  if (match && match[2]) {
    return match[2];
  }
  return null;
};

/**
 * Function to get the profile data from LinkedIn
 * @param {string} liUrl - The LinkedIn URL of the company
 * @param {Object} initialClient - The HTTP client for making requests
 * @param {Object} data - The task data
 * @returns {Promise<Object>} - The extracted profile data
 */
const getProfileData = async (liUrl, initialClient, data) => {
  // Extract the LinkedIn username from the URL
  const username = await extractLinkedInUsername(liUrl);

  // Construct the URL for the LinkedIn API
  const baseUrl = `https://www.linkedin.com/voyager/api/organization/companies?decorationId\u003Dcom.linkedin.voyager.deco.organization.web.WebFullCompanyMain-28\u0026q\u003DuniversalName\u0026universalName\u003D${username}`;

  // Make a GET request to the LinkedIn API
  const profileResponse = await initialClient.get(baseUrl);

  // Destructure the response data
  const {
    description,
    companyEmployeesSearchPageUrl,
    companyPageUrl,
    jobSearchPageUrl,
    name,
    tagline,
    universalName,
    salesNavigatorCompanyUrl,
    entityUrn,
    headquarter,
    companyIndustries,
    foundedOn,
    followingInfo,
    staffCount,
    staffCountRange,
    specialities,
  } = profileResponse.data.elements[0];

  // Construct the extracted data
  const extractedData = {
    input: liUrl,
    taskId: data.taskId,
    salesNavUrl: salesNavigatorCompanyUrl || "",
    description,
    employeesSearchPageUrl: companyEmployeesSearchPageUrl || "",
    pageUrl: companyPageUrl || "",
    jobSearchPageUrl: jobSearchPageUrl || "",
    name,
    tagline,
    universalName,
    linkedinId: entityUrn.split(":").at(-1) || "",

    city: headquarter?.city || "",
    country: headquarter?.country || "",
    geographicArea: headquarter?.geographicArea || "",
    postalCode: headquarter?.postalCode || "",

    industry: companyIndustries
      .map((industry) => industry.localizedName)
      .join(","),

    foundedOn: foundedOn?.year || "",
    followersCount: followingInfo?.followerCount || "",

    staffCount: staffCount || "",
    staffCountRange:
      staffCountRange?.start === undefined
        ? ""
        : `${staffCountRange?.start}-${staffCountRange?.end}`,
    specialities: specialities.join(","),
  };

  return extractedData;
};

/**
 * Function to save data to the database
 * @param {Object} data - The extracted profile data
 */
const saveData2Db = (data) => {
  taskDataDb.insertTaskData({ taskId: data.taskId, taskData: data });
  taskDataDb.close();
};

/**
 * Function to pause execution for a given time
 * @param {number} ms - The duration in milliseconds
 * @returns {Promise<void>}
 */
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Main function to get company profiles
 * @param {Object} param - An object containing event, data, headers, and tasksManager
 * @returns {Promise<void>}
 */
const GetCompanyProfiles = async ({ event, data, headers, tasksManager }) => {
  // Split the task input into individual URLs
  var urls = data.taskInput.split("\n");
  // Filter out any empty strings and trim whitespace
  urls = urls.filter((url) => url !== "").map((url) => url.trim());
  let progress;
  // Loop over each URL
  for (let i = 0; i < urls.length; i++) {
    console.log("url", urls[i]);
    const url = urls[i];
    const userAgent = getUserAgent();
    headers["User-Agent"] = userAgent;
    const initialJar = new CookieJar();
    const initialClient = createAxiosClient(headers, initialJar);
    let cookiesExpired = false;
    try {
      // Get the profile data for the current URL
      const profileResponse = await getProfileData(url, initialClient, data);
      // Save the profile data to the database
      saveData2Db(profileResponse);
    } catch (error) {
      // If an error occurs, save the error message to the database
      if (error.message==='Maximum number of redirects exceeded'){
        error.message = 'Session expired. Update your session cookies and try again.';
        cookiesExpired = true;
      }
      saveData2Db({ input: url, taskId: data.taskId, error: error.message });
    }

    // Check if the cookies have expired
    if (cookiesExpired){
      // If the cookies have expired, set the progress to 100%
      progress = 100;
      // Update the task progress
      tasksManager.updateTaskProgress(data.taskId, progress);
      // Update the account status to 0 (expired)
      accountsManager.updateAccountStatus(data.taskAccount, ACCOUNT_STATUS_EXPIRED);
      // Send a task-progress event
      event.sender.send("task-progress");
      // Break out of the loop
      break;
    }

    // Calculate the progress as a percentage
    progress = ((i + 1) * 100) / urls.length;
    // Update the task progress
    tasksManager.updateTaskProgress(data.taskId, progress);
    // Send a task-progress event
    event.sender.send("task-progress");
    // Pause for 10 seconds
    await sleep(10000);
  }
};

// Export the GetCompanyProfiles function as the default export
export default GetCompanyProfiles;