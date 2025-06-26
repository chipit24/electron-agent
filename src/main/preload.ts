// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

const agentApi = {
  sendMessage: (message: string) => {
    return ipcRenderer.invoke("agent:handleMessage", message);
  },
};
contextBridge.exposeInMainWorld("apiHandlers", agentApi);
export type AgentApi = typeof agentApi;
