import Store from "electron-store";
import { ipcMain } from "electron";

export const settingsStore = new Store({
  schema: {
    apiKey: {
      type: "string",
      default: "",
    },
    projectDirectory: {
      type: "string",
      default: "",
    },
  },
});

export function initSettingsHandlers(
  getSettingsWindow: () => Electron.BrowserWindow | undefined
) {
  ipcMain.handle("settings:getApiKey", () => {
    return settingsStore.get("apiKey") as string | undefined;
  });

  ipcMain.handle("settings:setApiKey", (_event, apiKey: string) => {
    settingsStore.set("apiKey", apiKey);
  });

  ipcMain.handle("settings:getProjectDirectory", () => {
    return settingsStore.get("projectDirectory") as string | undefined;
  });

  ipcMain.handle(
    "settings:setProjectDirectory",
    (_event, projectDirectory: string) => {
      settingsStore.set("projectDirectory", projectDirectory);
    }
  );

  ipcMain.handle("settings:closeWindow", () => {
    const settingsWindow = getSettingsWindow();
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close();
    }
  });
}
