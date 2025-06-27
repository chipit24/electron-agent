import Store from "electron-store";
import { ipcMain } from "electron";

export const settingsStore = new Store({
  schema: {
    apiKey: {
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

  ipcMain.handle("settings:closeWindow", () => {
    const settingsWindow = getSettingsWindow();
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close();
    }
  });
}
