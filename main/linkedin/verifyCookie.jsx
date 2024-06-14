import { createAxiosClient } from "./helpers";
const { CookieJar } = require("tough-cookie");
const { getUserAgent } = require("./userAgents");

const AUTH_BASE_URL = "https://www.linkedin.com";

/**
 * Extracts the CSRF token from cookies.
 * @param {Array<string>} cookies - An array of cookie strings.
 * @returns {string} The CSRF token.
 */
const getCSRFToken = (cookies) => {
  const jsessionCookie = cookies.find((cookie) =>
    cookie.startsWith("JSESSIONID=")
  );
  return jsessionCookie
    .split(";")[0]
    .replace("JSESSIONID=", "")
    .replace(/"/g, "");
};

/**
 * Updates the cookies array with an additional cookie.
 * @param {Array<string>} cookies - An array of cookie strings.
 * @param {string} additionalCookie - The additional cookie to be added.
 * @returns {string} The updated cookies as a single string.
 */
const updateCookies = (cookies, additionalCookie) => {
  cookies.push(additionalCookie);
  return cookies.map((cookie) => cookie.split(";")[0]).join(";");
};

/**
 * Verifies the session cookie with LinkedIn.
 * @param {string} sessionCookie - The session cookie to be verified.
 * @returns {Promise<[boolean, object|null, object|null]>} A tuple where the first element is a boolean indicating success,
 * the second is the profile data if successful, and the third is the headers.
 */
export default async function verifySession(sessionCookie) {
  const userAgent = getUserAgent();
  const initialHeaders = {
    Accept: "*/*",
    "User-Agent": userAgent,
  };

  const initialJar = new CookieJar();
  const initialClient = createAxiosClient(initialHeaders, initialJar);

  try {
    // Initial request to get CSRF token
    const authResponse = await initialClient.get(
      `${AUTH_BASE_URL}/uas/authenticate`
    );
    const csrfToken = getCSRFToken(authResponse.headers["set-cookie"]);

    // Update cookies with sessionCookie
    const newCookieHeader = updateCookies(
      authResponse.headers["set-cookie"],
      `li_at=${sessionCookie}`
    );

    const finalHeaders = {
      "User-Agent": userAgent,
      "csrf-token": csrfToken,
      Cookie: newCookieHeader,
    };

    const finalJar = new CookieJar();
    const finalClient = createAxiosClient(finalHeaders, finalJar);

    // Final request to verify session and get profile data
    const profileResponse = await finalClient.get(
      `${AUTH_BASE_URL}/voyager/api/me`
    );
    return [true, profileResponse.data, finalHeaders];
  } catch (error) {
    console.error("Error during session verification:", error);
    return [false, null];
  }
}