import type { AgentApi, SettingsApi } from "./preload";

declare global {
  interface Window {
    agentApi: AgentApi;
    settingsApi: SettingsApi;
  }
}
