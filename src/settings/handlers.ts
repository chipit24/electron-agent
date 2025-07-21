import { ipcMain } from "electron";
import { settingsStore } from "./store";

export function initSettingsHandlers(
  getSettingsWindow: () => Electron.BrowserWindow | undefined
) {
  /* Synchronous settings getter */
  ipcMain.on("settings:getAll", (event) => {
    event.returnValue = settingsStore.store;
  });

  /* Bulk settings setter */
  ipcMain.handle(
    "settings:setAll",
    (_event, settings: Partial<typeof settingsStore.store>) => {
      settingsStore.set({ ...settingsStore.store, ...settings });
    }
  );

  ipcMain.handle("settings:closeWindow", () => {
    const settingsWindow = getSettingsWindow();
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close();
    }
  });
}
