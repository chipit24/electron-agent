import { contextBridge, ipcRenderer } from "electron";

const settingsApi = {
  getApiKey: () => ipcRenderer.invoke("settings:getApiKey"),
  setApiKey: (apiKey: string) =>
    ipcRenderer.invoke("settings:setApiKey", apiKey),
  getProjectDirectory: () => ipcRenderer.invoke("settings:getProjectDirectory"),
  setProjectDirectory: (projectDirectory: string) =>
    ipcRenderer.invoke("settings:setProjectDirectory", projectDirectory),
  closeWindow: () => ipcRenderer.invoke("settings:closeWindow"),
};
contextBridge.exposeInMainWorld("settingsApi", settingsApi);
export type SettingsApi = typeof settingsApi;
