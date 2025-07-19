import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import type { Tool } from "../conversation";

export const tool: Tool<{
  directoryPath: string;
}> = async ({ projectRoot, directoryPath }) => {
  if (!directoryPath) {
    return JSON.stringify({
      error: "directoryPath must be a non-empty string",
    });
  }

  const fullDirectoryPath = join(projectRoot, directoryPath);

  try {
    /* Read directory contents */
    const entries = await readdir(fullDirectoryPath);

    /* Get detailed information for each entry */
    const items = [];
    for (const entry of entries) {
      try {
        const entryPath = join(fullDirectoryPath, entry);
        const stats = await stat(entryPath);

        items.push({
          name: entry,
          type: stats.isDirectory() ? "directory" : "file",
          size: stats.isFile() ? stats.size : null,
          modified: stats.mtime.toISOString(),
        });
      } catch {
        /* If we can't stat an entry, still include it with minimal info */
        items.push({
          name: entry,
          type: "unknown",
          size: null,
          modified: null,
          error: "Could not read entry details",
        });
      }
    }

    /* Sort entries: directories first, then files, alphabetically within each group */
    items.sort((a, b) => {
      if (a.type === "directory" && b.type !== "directory") return -1;
      if (a.type !== "directory" && b.type === "directory") return 1;
      return a.name.localeCompare(b.name);
    });

    return JSON.stringify({
      success: true,
      directoryPath,
      items,
      totalCount: items.length,
      directories: items.filter((item) => item.type === "directory").length,
      files: items.filter((item) => item.type === "file").length,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return JSON.stringify({
      success: false,
      error: `Failed to list directory: ${err.message || "Unknown error"}`,
      directoryPath,
    });
  }
};

export const metadata = {
  name: "listDirectory",
  description:
    "List the contents of a directory with file type and metadata information",
  params: {
    directoryPath: {
      type: "string",
      description: "Path to the directory to list (relative to project root)",
    },
  },
  requiredParams: ["directoryPath"],
};
