import { ipcMain } from "electron";
import { Mistral } from "@mistralai/mistralai";
import { settingsStore } from "../settings/handlers";
import { Conversation } from "./conversation";

let client: Mistral | undefined;
const conversation = new Conversation();

export function initAgentsHandlers(
  getMainWindow: () => Electron.BrowserWindow | undefined
) {
  const apiKey = settingsStore.get("apiKey") as string | undefined;
  if (apiKey) {
    client = new Mistral({ apiKey });
  }
  settingsStore.onDidChange("apiKey", (newApiKey, prevApiKey) => {
    if (prevApiKey === newApiKey) {
      return;
    }

    client = newApiKey
      ? new Mistral({ apiKey: newApiKey as string })
      : undefined;

    getMainWindow()?.webContents?.send(
      "agent:apiKeyChanged",
      Boolean(newApiKey)
    );
  });

  ipcMain.handle("agent:hasApiKey", () => {
    return Boolean(settingsStore.get("apiKey"));
  });

  ipcMain.handle("agent:handleMessage", (_event, userMessage: string) => {
    if (!client) {
      return;
    }

    try {
      return conversation.sendMessage(client, userMessage);
    } catch (error) {
      console.error("Error in conversation.sendMessage:", error);
      throw error;
    }
  });
}
