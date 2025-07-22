import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import type { Tool } from "../conversation";

export const tool: Tool<{
  directoryPath: string;
  recursive?: boolean;
}> = async ({ projectRoot, directoryPath, recursive = false }) => {
  if (!directoryPath) {
    return JSON.stringify({
      error: "directoryPath must be a non-empty string",
    });
  }

  const fullDirectoryPath = join(projectRoot, directoryPath);

  try {
    if (recursive) {
      /* Recursive mode - get all files and folders */
      const allItems = await getAllFilesAndFolders(
        fullDirectoryPath,
        directoryPath
      );
      return JSON.stringify({
        directoryPath,
        recursive: true,
        items: allItems,
        totalCount: allItems.length,
        directories: allItems.filter((item) => item.type === "directory")
          .length,
        files: allItems.filter((item) => item.type === "file").length,
      });
    } else {
      /* Non-recursive mode - only immediate contents */
      const entries = await readdir(fullDirectoryPath);

      /* Get detailed information for each entry */
      const items = [];
      for (const entry of entries) {
        try {
          const entryPath = join(fullDirectoryPath, entry);
          const stats = await stat(entryPath);

          items.push({
            name: entry,
            path: join(directoryPath, entry),
            type: stats.isDirectory() ? "directory" : "file",
            size: stats.isFile() ? stats.size : null,
            modified: stats.mtime.toISOString(),
          });
        } catch {
          /* If we can't stat an entry, still include it with minimal info */
          items.push({
            name: entry,
            path: join(directoryPath, entry),
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
        directoryPath,
        recursive: false,
        items,
        totalCount: items.length,
        directories: items.filter((item) => item.type === "directory").length,
        files: items.filter((item) => item.type === "file").length,
      });
    }
  } catch (error) {
    return JSON.stringify({
      error: `Failed to list directory: ${error}`,
      directoryPath,
    });
  }
};

async function getAllFilesAndFolders(
  dir: string,
  relativePath: string
): Promise<
  Array<{
    name: string;
    path: string;
    type: "file" | "directory";
    size: number | null;
    modified: string;
  }>
> {
  const entries = await readdir(dir, { withFileTypes: true });
  const items = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const itemRelativePath = join(relativePath, entry.name);

    if (entry.isDirectory()) {
      /* Skip common directories that shouldn't be included */
      if (
        ["node_modules", ".git", "dist", "out", ".vscode", "build"].includes(
          entry.name
        )
      ) {
        continue;
      }

      try {
        const stats = await stat(fullPath);
        items.push({
          name: entry.name,
          path: itemRelativePath,
          type: "directory" as const,
          size: null,
          modified: stats.mtime.toISOString(),
        });

        /* Recursively get contents of subdirectory */
        const subItems = await getAllFilesAndFolders(
          fullPath,
          itemRelativePath
        );
        items.push(...subItems);
      } catch {
        /* If we can't access the directory, still include it */
        items.push({
          name: entry.name,
          path: itemRelativePath,
          type: "directory" as const,
          size: null,
          modified: new Date().toISOString(),
        });
      }
    } else {
      try {
        const stats = await stat(fullPath);
        items.push({
          name: entry.name,
          path: itemRelativePath,
          type: "file" as const,
          size: stats.size,
          modified: stats.mtime.toISOString(),
        });
      } catch {
        /* If we can't stat the file, still include it */
        items.push({
          name: entry.name,
          path: itemRelativePath,
          type: "file" as const,
          size: null,
          modified: new Date().toISOString(),
        });
      }
    }
  }

  return items;
}

export const metadata = {
  name: "listDirectory",
  description:
    "List the contents of a directory with file type and metadata information. Can optionally list recursively.",
  params: {
    directoryPath: {
      type: "string",
      description: "Path to the directory to list (relative to project root)",
    },
    recursive: {
      type: "boolean",
      description:
        "Whether to list all files and subdirectories recursively (defaults to false)",
    },
  },
  requiredParams: ["directoryPath"],
};
