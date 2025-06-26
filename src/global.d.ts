import type { AgentApi, SettingsApi } from "./main/preload";
import type { SettingsApi } from "./settings/preload";

declare global {
  interface Window {
    agentApi: AgentApi;
    settingsApi: SettingsApi;
  }
}
