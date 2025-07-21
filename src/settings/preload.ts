import { contextBridge, ipcRenderer } from "electron";
import type { Settings } from "./store";

const settingsApi = {
  /* Synchronous settings access */
  getSettings: (): Settings => {
    return ipcRenderer.sendSync("settings:getAll");
  },

  /* Async setter for updating settings */
  setSettings: (settings: Partial<Settings>) =>
    ipcRenderer.invoke("settings:setAll", settings),

  /* Window management */
  closeWindow: () => ipcRenderer.invoke("settings:closeWindow"),
};

contextBridge.exposeInMainWorld("settingsApi", settingsApi);
export type SettingsApi = typeof settingsApi;
