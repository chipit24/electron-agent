import Store from "electron-store";
import { ipcMain } from "electron";

const settings = new Store({
  name: "app-settings",
});

export function initSettingsHandlers() {
  // Set up IPC handlers for settings
  ipcMain.handle("settings:getApiKey", () => {
    return settings.get("apiKey") as string | undefined;
  });

  ipcMain.handle("settings:setApiKey", (event, apiKey: string) => {
    settings.set("apiKey", apiKey);
  });

  ipcMain.handle("settings:clearApiKey", () => {
    settings.delete("apiKey");
  });
}
