import userAgents from "./userAgents.json";

/**
 * Selects a random user-agent string from a predefined list.
 * @returns {string} A random user-agent string.
 */
export const getUserAgent = () => {
  const index = Math.floor(Math.random() * userAgents.length);
  const userAgent = userAgents[index];
  return userAgent;
};