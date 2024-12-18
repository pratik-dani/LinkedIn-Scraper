// Import necessary modules
const { CookieJar } = require("tough-cookie");
const { getUserAgent } = require("./userAgents");
const { createAxiosClient } = require("./helpers");
import TaskDataDatabaseManager from "../database/TaskDataDB";
import AccountsDatabaseManager from "../database/AccountsDB";
// const TaskDataDatabaseManager = require("../database/TaskDataDB");
const { app } = require("electron");
const path = require("path");
const { parse } = require("url");

// Checking if the environment is production
const isProd = process.env.NODE_ENV === "production";
const ACCOUNT_STATUS_EXPIRED = 0;
let taskDataDb;
let accountsManager;
let db_path;
if (isProd) {
  let path_ = app.getPath("documents");
  console.log(path_);
  db_path = path.join(path_, "database.db");
} else {
  db_path = "database.db";
}
taskDataDb = new TaskDataDatabaseManager(db_path);
accountsManager = new AccountsDatabaseManager(db_path);

const getActivityUrn = (url) => {
  const link = parse(url);
  const activityId = link.pathname.split("/").pop().split(":").slice(-1)[0];
  return activityId;
};

const getPostData = async (url, initialClient, data, params) => {
  let limit = 3000;
  const response = await initialClient.get(
    `https://www.linkedin.com/voyager/api/feed/updatesV2?commentsCount=${limit}&likesCount=${limit}&moduleKey=feed-item%3Adesktop&q=backendUrnOrNss&urnOrNss=urn%3Ali%3Aactivity%3A${params["urnOrNss"]}`
  );

  const elements = response.data.elements[0].socialDetail;
  const likes = elements.reactionElements;
  const comments = elements.comments.elements;

  const likersName = likes.map((s) => (s.name ? s.name.text : ""));
  const likersHeadlines = likes.map((s) =>
    s.description ? s.description.text : ""
  );
  const likersProfileUrl = likes.map((s) =>
    s.navigationContext ? s.navigationContext.actionTarget : ""
  );
  const likersSalesNavId = likes.map((s) =>
    s.actorUrn ? s.actorUrn.split(":").pop() : ""
  );

  const likersData = likersName.map((name, i) => ({
    name,
    headline: likersHeadlines[i],
    profileUrl: likersProfileUrl[i],
    salesNavId: likersSalesNavId[i],
    type: "like",
  }));

  const commentersMiniprofile = comments.map((s) =>
    s.commenter
      ? s.commenter["com.linkedin.voyager.feed.MemberActor"]
        ? s.commenter["com.linkedin.voyager.feed.MemberActor"].miniProfile
        : s.commenter["com.linkedin.voyager.feed.CompanyActor"].miniCompany
      : {}
  );
  const commentersName = commentersMiniprofile.map((s) =>
    s.firstName ? `${s.firstName || ""} ${s.lastName || ""}` : s.name || ""
  );
  const commentersHeadlines = commentersMiniprofile.map(
    (s) => s.occupation || ""
  );
  const commentersProfileUrl = commentersMiniprofile.map((s) =>
    s.publicIdentifier ? s.universalName : ""
  );
  const commentersSalesNavId = commentersMiniprofile.map((s) =>
    s.dashEntityUrn
      ? s.dashEntityUrn.split(":").pop()
      : s.dashCompanyUrn.split(":").pop()
  );

  const commentersData = commentersName.map((name, i) => ({
    name,
    headline: commentersHeadlines[i],
    profileUrl: commentersProfileUrl[i],
    salesNavId: commentersSalesNavId[i],
    type: "comment",
  }));
  const allData = [...likersData, ...commentersData];
  allData.forEach((data) => {
    data.postLink = `https://www.linkedin.com/feed/update/urn:li:activity:${params["urnOrNss"]}`;
    data.taskId = data.taskId;
  });
  return allData;
};

const saveData2Db = (data, taskId) => {
  data.forEach((d) => {
    taskDataDb.insertTaskData({ taskId: taskId, taskData: d });
  });
};

const GetPostsData = async ({ event, data, headers, tasksManager }) => {
  let cookiesExpired = false;
  var postUrl = data.taskInput;
  const activityUrn = getActivityUrn(postUrl);

  const userAgent = getUserAgent();
  headers["User-Agent"] = userAgent;
  const initialJar = new CookieJar();
  const initialClient = createAxiosClient(headers, initialJar);

  const limit = 3000;
  const params = {
    commentsCount: limit,
    likesCount: limit,
    moduleKey: "feed-item:desktop",
    q: "backendUrnOrNss",
    urnOrNss: activityUrn,
  };
  const url = "https://www.linkedin.com/voyager/api/feed/updatesV2";
  try {
    // Get the profile data for the current URL
    const postResponse = await getPostData(url, initialClient, data, params);
    // Save the profile data to the database
    saveData2Db(postResponse, data.taskId);
  } catch (error) {
    // If an error occurs, save the error message to the database
    if (error.message === "Maximum number of redirects exceeded") {
      error.message =
        "Session expired. Update your session cookies and try again.";
      cookiesExpired = true;
    }
    saveData2Db([{ input: url, taskId: data.taskId, error: error.message }], data.taskId);
  }

  // Check if the cookies have expired
  if (cookiesExpired) {
    // Update the account status to 0 (expired)
    accountsManager.updateAccountStatus(data.taskAccount, ACCOUNT_STATUS_EXPIRED);
  }
  tasksManager.updateTaskProgress(data.taskId, 100);
  // Send a task-progress event
  event.sender.send("task-progress");
  taskDataDb.close();
  accountsManager.close();
};
export default GetPostsData;
