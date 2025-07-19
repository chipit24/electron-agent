import { exec } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
import type { Tool } from "../conversation";

const execAsync = promisify(exec);

export const tool: Tool<{
  pattern: string;
  directory?: string;
  caseSensitive?: boolean;
}> = async ({
  projectRoot,
  pattern,
  directory = ".",
  caseSensitive = false,
}) => {
  if (!pattern) {
    return JSON.stringify({ error: "pattern must be a non-empty string" });
  }

  const searchDirectory = join(projectRoot, directory);

  try {
    /* Build grep command with options */
    const grepOptions = [
      "-r", // recursive
      "-n", // show line numbers
      "-H", // show filenames
      "--exclude-dir=node_modules",
      "--exclude-dir=.git",
      "--exclude-dir=dist",
      "--exclude-dir=out",
      "--exclude-dir=build",
      "--exclude=*.log",
      "--exclude=*.min.js",
      "--exclude=*.min.css",
    ];

    if (!caseSensitive) {
      grepOptions.push("-i"); // case insensitive
    }

    /* Escape the pattern for shell safety */
    const escapedPattern = pattern.replace(/['"\\]/g, "\\$&");

    const command = `grep ${grepOptions.join(" ")} "${escapedPattern}" "${searchDirectory}"`;

    const { stdout } = await execAsync(command, {
      cwd: projectRoot,
      timeout: 15_000, // 15 second timeout
      maxBuffer: 2 * 1024 * 1024, // 2MB buffer
      encoding: "utf8",
    });

    /* Parse grep output into structured results */
    const results = [];
    if (stdout.trim()) {
      const lines = stdout.trim().split("\n");
      for (const line of lines) {
        const match = line.match(/^([^:]+):(\d+):(.*)$/);
        if (match) {
          const [, filePath, lineNumber, content] = match;
          /* Make file path relative to project root */
          const relativePath = filePath.startsWith(projectRoot)
            ? filePath.substring(projectRoot.length + 1)
            : filePath;

          results.push({
            file: relativePath,
            line: parseInt(lineNumber, 10),
            content: content.trim(),
          });
        }
      }
    }

    return JSON.stringify({
      success: true,
      pattern,
      directory,
      caseSensitive,
      results,
      matchCount: results.length,
    });
  } catch (error: unknown) {
    const err = error as { code?: number; stderr?: string; message?: string };
    /* grep returns exit code 1 when no matches found, which is not an error */
    if (err.code === 1 && !err.stderr) {
      return JSON.stringify({
        success: true,
        pattern,
        directory,
        caseSensitive,
        results: [],
        matchCount: 0,
      });
    }

    return JSON.stringify({
      success: false,
      error: `Search failed: ${err.message || "Unknown error"}`,
      pattern,
      directory,
    });
  }
};

export const metadata = {
  name: "searchFiles",
  description:
    "Search for text patterns in files using grep. Excludes common build directories and files.",
  params: {
    pattern: {
      type: "string",
      description: "Text pattern to search for",
    },
    directory: {
      type: "string",
      description:
        "Directory to search in (relative to project root, defaults to '.')",
    },
    caseSensitive: {
      type: "boolean",
      description:
        "Whether the search should be case sensitive (defaults to false)",
    },
  },
  requiredParams: ["pattern"],
};
