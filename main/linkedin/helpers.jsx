const axios = require("axios");

/**
 * Creates an Axios client with custom headers and a cookie jar.
 * @param {Object} headers - The headers to be set for the Axios client.
 * @param {CookieJar} jar - The cookie jar to store cookies.
 * @returns {AxiosInstance} The configured Axios instance.
 */
export const createAxiosClient = (headers, jar) => {
  const client = axios.create({
    headers,
    jar,
    withCredentials: true,
  });
  return client;
};
