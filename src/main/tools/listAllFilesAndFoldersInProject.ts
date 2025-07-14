import { settingsStore } from "../../settings/handlers";
import { readdir } from "node:fs/promises";
import path from "node:path";

export async function tool() {
  const projectRoot = settingsStore.get("projectDirectory") as string;
  if (!projectRoot) {
    return JSON.stringify({ error: "Project directory not set in settings" });
  }

  try {
    const files = await getAllFiles(projectRoot);
    return JSON.stringify(files);
  } catch (error) {
    return JSON.stringify({
      error: `Failed to read directory: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

export const metadata = {
  name: "listAllFilesAndFoldersInProject",
  description: "List all files and folders in the project directory",
  params: {},
  requiredParams: [],
};

async function getAllFiles(dir: string, relativePath = ""): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativeEntryPath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      /* Skip common directories that shouldn't be included */
      if (
        ["node_modules", ".git", "dist", "out", ".vscode"].includes(entry.name)
      ) {
        continue;
      }
      files.push(relativeEntryPath + "/");
      const subFiles = await getAllFiles(fullPath, relativeEntryPath);
      files.push(...subFiles);
    } else {
      files.push(relativeEntryPath);
    }
  }

  return files;
}
