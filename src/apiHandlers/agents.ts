import { ipcMain } from "electron";

export function initAgentsHandlers() {
  ipcMain.handle("agent:handleMessage", (_event, message) => {
    const transformedMessage = `🎉 ${message} 🎉`;
    return transformedMessage;
  });
}
