import { ipcMain } from "electron";

export function initHandlers() {
  ipcMain.handle("handleMessage", (_event, message) => {
    const transformedMessage = `🎉 ${message} 🎉`;
    return transformedMessage;
  });
}
