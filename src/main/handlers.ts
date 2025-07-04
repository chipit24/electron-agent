import { ipcMain } from "electron";
import { settingsStore } from "../settings/handlers";
import { Conversation } from "./conversation";

let conversation: Conversation;

export function initAgentsHandlers(
  getMainWindow: () => Electron.BrowserWindow | undefined
) {
  const apiKey = settingsStore.get("apiKey") as string | undefined;
  conversation = new Conversation(apiKey);

  settingsStore.onDidChange("apiKey", (newApiKey, prevApiKey) => {
    if (prevApiKey === newApiKey) {
      return;
    }

    conversation.setApiKey(newApiKey as string);

    getMainWindow()?.webContents?.send(
      "agent:apiKeyChanged",
      Boolean(newApiKey)
    );
  });

  ipcMain.handle("agent:hasApiKey", () => {
    return Boolean(settingsStore.get("apiKey"));
  });

  ipcMain.handle("agent:getMaxContextLength", async () => {
    return conversation.getMaxContentLength();
  });

  ipcMain.handle("agent:handleMessage", (_event, userMessage: string) => {
    if (!conversation) {
      return;
    }

    try {
      return conversation.sendMessage(userMessage);
    } catch (error) {
      console.error("Error in conversation.sendMessage:", error);
      throw error;
    }
  });
}
