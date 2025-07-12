/* See the Electron documentation for details on how to use preload scripts:
 * https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts */
import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";
import { type ConversationMessageResponse } from "./conversation";

const agentApi = {
  hasApiKey: () => {
    return ipcRenderer.invoke("agent:hasApiKey");
  },
  sendMessage: (userMessage: string): Promise<ConversationMessageResponse> => {
    return ipcRenderer.invoke("agent:handleMessage", userMessage);
  },
  executeToolCall: (approve: boolean): Promise<ConversationMessageResponse> => {
    return ipcRenderer.invoke("agent:executeToolCall", approve);
  },
  onApiKeyChanged: (callback: (hasApiKey: boolean) => void) => {
    const listener = (_event: IpcRendererEvent, hasApiKey: boolean) =>
      callback(hasApiKey);
    ipcRenderer.on("agent:apiKeyChanged", listener);
    return () => ipcRenderer.off("agent:apiKeyChanged", listener);
  },
  getMaxContextLength: (): Promise<number> => {
    return ipcRenderer.invoke("agent:getMaxContextLength");
  },
};
contextBridge.exposeInMainWorld("agentApi", agentApi);
export type AgentApi = typeof agentApi;
