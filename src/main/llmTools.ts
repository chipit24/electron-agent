import type { Tool as MistralTool } from "@mistralai/mistralai/models/components";
import type { Tool } from "./conversation";
import * as executeBashCommand from "./tools/executeBashCommand";
import * as editFile from "./tools/editFile";
import * as readFile from "./tools/readFile";
import * as writeFile from "./tools/writeFile";
import * as searchInFiles from "./tools/searchInFiles";
import * as listDirectory from "./tools/listDirectory";
import * as globFiles from "./tools/globFiles";

/* When adding a new tool, import it above and add it to this list.
 * You should not have to modify `toolMap` or `agentToolList`; they are derived from this list */
const tools = [
  listDirectory,
  globFiles,
  searchInFiles,
  readFile,
  writeFile,
  editFile,
  executeBashCommand,
];

export const toolMap = tools.reduce(
  (map, { tool, metadata }) => {
    map[metadata.name] = tool as Tool;
    return map;
  },
  {} as Record<string, Tool>
);

export const agentToolList: MistralTool[] = tools.map(({ metadata }) => ({
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
