import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Tool } from "../conversation";

export const tool: Tool<{
  filePath: string;
}> = async ({ projectRoot, filePath }) => {
  if (!filePath) {
    return JSON.stringify({ error: "filePath must be a non-empty string" });
  }

  const fullFilePath = join(projectRoot, filePath);

  try {
    /* Check if file exists */
    if (!existsSync(fullFilePath)) {
      return JSON.stringify({ error: `File does not exist: ${filePath}` });
    }

    /* Read file content */
    const content = await readFile(fullFilePath, "utf8");

    return JSON.stringify({
      filePath,
      content,
      size: content.length,
    });
  } catch (error: unknown) {
    return JSON.stringify({
      error: `Failed to read file: ${error}`,
      filePath,
    });
  }
};

export const metadata = {
  name: "readFile",
  description: "Read the contents of a file in the project directory",
  params: {
    filePath: {
      type: "string",
      description: "Path to the file to read (relative to project root)",
    },
  },
  requiredParams: ["filePath"],
};
