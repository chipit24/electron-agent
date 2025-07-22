import { glob } from "node:fs/promises";
import { join } from "node:path";
import type { Tool } from "../conversation";

export const tool: Tool<{
  pattern: string;
  directory?: string;
  includeDirectories?: boolean;
}> = async ({
  projectRoot,
  pattern,
  directory = ".",
  includeDirectories = false,
}) => {
  if (!pattern) {
    return JSON.stringify({
      error: "pattern must be a non-empty string",
    });
  }

  const searchPath = join(projectRoot, directory);

  try {
    /* Use glob with exclude patterns and withFileTypes */
    const filtered: string[] = [];
    for await (const match of glob(pattern, {
      cwd: searchPath,
      withFileTypes: true,
      exclude: [
        "**/.*", // Hidden files and directories
        "**/node_modules/**",
        "**/.git/**",
        "**/dist/**",
        "**/out/**",
        "**/build/**",
        "**/.vscode/**",
        "**/*.log",
        "**/*.tmp",
      ],
    })) {
      /* Handle directory filtering using withFileTypes */
      if (!includeDirectories && match.isDirectory()) {
        continue;
      }

      filtered.push(match.name);
    }

    /* Sort the results */
    filtered.sort();

    return JSON.stringify({
      pattern,
      directory,
      includeDirectories,
      matches: filtered,
      matchCount: filtered.length,
    });
  } catch (error) {
    return JSON.stringify({
      error: `Glob search failed: ${error}`,
      pattern,
      directory,
    });
  }
};

export const metadata = {
  name: "globFiles",
  description:
    "Find files using glob patterns (e.g., '**/*.ts', 'src/**/*.json'). Supports standard glob syntax with wildcards.",
  params: {
    pattern: {
      type: "string",
      description:
        "Glob pattern to match files (e.g., '**/*.ts', 'src/**/*.json', '*.md')",
    },
    directory: {
      type: "string",
      description:
        "Directory to search in (relative to project root, defaults to '.')",
    },
    includeDirectories: {
      type: "boolean",
      description:
        "Whether to include directories in results (defaults to false)",
    },
  },
  requiredParams: ["pattern"],
};
