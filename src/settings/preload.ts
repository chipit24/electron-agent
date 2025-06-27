import { contextBridge, ipcRenderer } from "electron";

const settingsApi = {
  getApiKey: () => ipcRenderer.invoke("settings:getApiKey"),
  setApiKey: (apiKey: string) =>
    ipcRenderer.invoke("settings:setApiKey", apiKey),
  closeWindow: () => ipcRenderer.invoke("settings:closeWindow"),
};
contextBridge.exposeInMainWorld("settingsApi", settingsApi);
export type SettingsApi = typeof settingsApi;
