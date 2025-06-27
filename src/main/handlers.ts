import { ipcMain } from "electron";
import { Mistral } from "@mistralai/mistralai";
import { settingsStore } from "../settings/handlers";

let client: Mistral | undefined;

export function initAgentsHandlers() {
  const apiKey = settingsStore.get("apiKey") as string | undefined;

  if (apiKey) {
    client = new Mistral({ apiKey });
  }

  settingsStore.onDidChange("apiKey", (prevApiKey, newApiKey) => {
    if (prevApiKey === newApiKey) {
      return;
    }

    if (newApiKey === undefined) {
      client = undefined;
    }

    client = new Mistral({ apiKey: newApiKey as string });
  });

  ipcMain.handle("agent:handleMessage", async (_event, message) => {
    if (!client) {
      console.warn("Mistral client not initialized.");
      return;
    }

    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: message }],
    });

    return chatResponse.choices[0].message.content;
  });
}
