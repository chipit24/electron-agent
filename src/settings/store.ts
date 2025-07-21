import Store from "electron-store";
import type { FromSchema } from "json-schema-to-ts";

const settingsSchema = {
  type: "object",
  properties: {
    apiKey: {
      type: "string",
      default: "",
    },
    projectDirectory: {
      type: "string",
      default: "",
    },
  },
  additionalProperties: false,
} as const;

export type Settings = FromSchema<typeof settingsSchema>;

export const settingsStore = new Store<Settings>({
  schema: settingsSchema.properties,
});
