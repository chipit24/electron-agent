import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import type { Tool } from "../conversation";

export const tool: Tool<{
  filePath: string;
  content: string;
}> = async ({ projectRoot, filePath, content }) => {
  if (!filePath) {
    return JSON.stringify({ error: "filePath must be a non-empty string" });
  }

  if (content === undefined) {
    return JSON.stringify({ error: "content must be a string" });
  }

  const fullFilePath = join(projectRoot, filePath);

  try {
    /* Create parent directories if they don't exist */
    const parentDir = dirname(fullFilePath);
    await mkdir(parentDir, { recursive: true });

    /* Write file content */
    await writeFile(fullFilePath, content, "utf8");

    return JSON.stringify({
      filePath,
      message: `Successfully wrote ${content.length} characters to ${filePath}`,
      size: content.length,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return JSON.stringify({
      error: `Failed to write file: ${err.message || "Unknown error"}`,
      filePath,
    });
  }
};

export const metadata = {
  name: "writeFile",
  description:
    "Write content to a file in the project directory. Creates parent directories if needed and overwrites existing files.",
  params: {
    filePath: {
      type: "string",
      description: "Path to the file to write (relative to project root)",
    },
    content: {
      type: "string",
      description: "Content to write to the file",
    },
  },
  requiredParams: ["filePath", "content"],
};
