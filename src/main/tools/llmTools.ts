import type { Tool } from "@mistralai/mistralai/models/components";
import { type FunctionCall } from "@mistralai/mistralai/src/models/components/functioncall";
import * as listAllFilesAndFoldersInProject from "./listAllFilesAndFoldersInProject";

/* When adding a new tool, import it above and add it to this list.
 * You should not have to modify `toolMap` or `agentToolList`; they are derived from this list */
const tools = [listAllFilesAndFoldersInProject];

export const toolMap = tools.reduce(
  (map, { tool, metadata }) => {
    map[metadata.name] = tool;
    return map;
  },
  {} as Record<string, (args: FunctionCall["arguments"]) => Promise<string>>
);

export const agentToolList: Tool[] = tools.map(({ metadata }) => ({
  type: "function",
  function: {
    name: metadata.name,
    description: metadata.description,
    parameters: {
      type: "object",
      properties: {
        ...metadata.params,
      },
      required: [...metadata.requiredParams],
    },
  },
}));
