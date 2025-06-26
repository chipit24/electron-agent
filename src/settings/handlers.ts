import Store from "electron-store";
import { ipcMain } from "electron";

const store = new Store();

export function initSettingsHandlers(
  getSettingsWindow: () => Electron.BrowserWindow | undefined
) {
  // Set up IPC handlers for handlers
  ipcMain.handle("settings:getApiKey", () => {
    return store.get("apiKey") as string | undefined;
  });

  ipcMain.handle("settings:setApiKey", (_event, apiKey: string) => {
    store.set("apiKey", apiKey);
  });

  ipcMain.handle("settings:clearApiKey", () => {
    store.delete("apiKey");
  });

  ipcMain.handle("settings:closeWindow", () => {
    const settingsWindow = getSettingsWindow();
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close();
    }
  });
}
