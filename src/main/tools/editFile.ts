import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Tool } from "../conversation";

export const tool: Tool<{ filePath: string; newContent: string }> = async ({
  projectRoot,
  filePath,
  newContent,
}) => {
  const fullFilePath = join(projectRoot, filePath);

  try {
    /* Check if file exists */
    if (!existsSync(fullFilePath)) {
      return JSON.stringify({ error: `File does not exist: ${filePath}` });
    }

    /* Write the new content to file */
    await writeFile(fullFilePath, newContent, "utf8");

    return JSON.stringify({
      message: `Successfully updated ${filePath}`,
      filePath,
      applied: true,
    });
  } catch (error) {
    return JSON.stringify({
      error: `Failed to edit file: ${error}`,
      details: "An error occurred while writing the new content to the file",
      suggestion: "Check file permissions and ensure the path is correct",
    });
  }
};

export const metadata = {
  name: "editFile",
  description:
    "Edit a file by providing the complete new content. The entire file will be overwritten with the provided content.",
  params: {
    filePath: {
      type: "string",
      description: "Path to the file to edit (relative to project root)",
    },
    newContent: {
      type: "string",
      description:
        "The complete new content for the file. This will replace the entire existing file content.",
    },
  },
  requiredParams: ["filePath", "newContent"],
};
