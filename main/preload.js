import { contextBridge, ipcRenderer } from "electron";

// Define a handler object to manage IPC communication
const handler = {
  /**
   * Sends data to the main process via a specified channel.
   * 
   * @param {string} channel - The channel to send the data through.
   * @param {*} value - The data to send.
   */
  send(channel, value) {
    ipcRenderer.send(channel, value);
  },

  /**
   * Listens for messages from the main process on a specified channel.
   * 
   * @param {string} channel - The channel to listen on.
   * @param {function} callback - The function to call when a message is received.
   * @returns {function} - A function to unsubscribe from the channel.
   */
  on(channel, callback) {
    // Define a subscription function to handle incoming messages
    const subscription = (_event, ...args) => callback(...args);
    
    // Register the subscription function with ipcRenderer
    ipcRenderer.on(channel, subscription);

    // Return a function to remove the listener
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  }
};

// Expose the handler object in the main world under the "ipc" namespace
contextBridge.exposeInMainWorld("ipc", handler);
