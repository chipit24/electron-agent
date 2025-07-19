import type { Tool as MistralTool } from "@mistralai/mistralai/models/components";
import type { Tool } from "../conversation";
import * as listAllFilesAndFoldersInProject from "./listAllFilesAndFoldersInProject";
import * as executeBashCommand from "./executeBashCommand";
import * as editFile from "./editFile";
import * as readFile from "./readFile";
import * as writeFile from "./writeFile";
import * as searchFiles from "./searchFiles";
import * as listDirectory from "./listDirectory";

/* When adding a new tool, import it above and add it to this list.
 * You should not have to modify `toolMap` or `agentToolList`; they are derived from this list */
const tools = [
  listAllFilesAndFoldersInProject,
  executeBashCommand,
  editFile,
  readFile,
  writeFile,
  searchFiles,
  listDirectory,
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
