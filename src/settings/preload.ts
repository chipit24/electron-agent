import { contextBridge, ipcRenderer } from "electron";

const settingsApi = {
  getApiKey: () => ipcRenderer.invoke("settings:getApiKey"),
  setApiKey: (apiKey: string) =>
    ipcRenderer.invoke("settings:setApiKey", apiKey),
  clearApiKey: () => ipcRenderer.invoke("settings:clearApiKey"),
};
contextBridge.exposeInMainWorld("settingsApi", settingsApi);
export type SettingsApi = typeof settingsApi;
