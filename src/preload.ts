// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

export const agentApi = {
  sendMessage: (message: string) => {
    return ipcRenderer.invoke("handleMessage", message);
  },
};

export type AgentApi = typeof agentApi;

contextBridge.exposeInMainWorld("agentApi", agentApi);
