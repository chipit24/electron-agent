/* See the Electron documentation for details on how to use preload scripts:
 * https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts */
import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";

const agentApi = {
  hasApiKey: () => {
    return ipcRenderer.invoke("agent:hasApiKey");
  },
  sendMessage: (userMessage: string) => {
    return ipcRenderer.invoke("agent:handleMessage", userMessage);
  },
  onApiKeyChanged: (callback: (hasApiKey: boolean) => void) => {
    const listener = (_event: IpcRendererEvent, hasApiKey: boolean) =>
      callback(hasApiKey);
    ipcRenderer.on("agent:apiKeyChanged", listener);
    return () => ipcRenderer.off("agent:apiKeyChanged", listener);
  },
};
contextBridge.exposeInMainWorld("agentApi", agentApi);
export type AgentApi = typeof agentApi;
