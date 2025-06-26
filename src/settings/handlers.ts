import Store from "electron-store";
import { ipcMain } from "electron";

const store = new Store();

export function initSettingsHandlers() {
  // Set up IPC handlers for handlers
  ipcMain.handle("settings:getApiKey", () => {
    return store.get("apiKey") as string | undefined;
  });

  ipcMain.handle("settings:setApiKey", (event, apiKey: string) => {
    store.set("apiKey", apiKey);
  });

  ipcMain.handle("settings:clearApiKey", () => {
    store.delete("apiKey");
  });
}
