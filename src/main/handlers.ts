import { ipcMain } from "electron";
import { Mistral } from "@mistralai/mistralai";
import { settingsStore } from "../settings/handlers";

let client: Mistral | undefined;

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

  ipcMain.handle("agent:handleMessage", async (_event, message) => {
    if (!client) {
      return;
    }

    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: message }],
    });

    return chatResponse.choices[0].message.content;
  });
}
