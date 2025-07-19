import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { Tool } from "../conversation";

const execAsync = promisify(exec);

export const tool: Tool<{
  command: string[];
}> = async ({ projectRoot, command }) => {
  if (!command || !Array.isArray(command) || command.length === 0) {
    return JSON.stringify({
      error: "Command must be a non-empty array of strings",
    });
  }

  /* Join command array into a single command string */
  const commandString = command.join(" ");

  try {
    const { stdout, stderr } = await execAsync(commandString, {
      cwd: projectRoot,
      timeout: 30_000, // 30 second timeout
      maxBuffer: 1024 * 1024, // 1MB buffer
      encoding: "utf8",
    });

    return JSON.stringify({
      success: true,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0,
      command: commandString,
    });
  } catch (error: unknown) {
    const err = error as {
      stdout?: string;
      stderr?: string;
      code?: number;
      message?: string;
    };
    return JSON.stringify({
      success: false,
      stdout: err.stdout ? err.stdout.trim() : "",
      stderr: err.stderr ? err.stderr.trim() : "",
      exitCode: err.code || 1,
      command: commandString,
      error: err.message,
    });
  }
};

export const metadata = {
  name: "executeBashCommand",
  description:
    "Execute a bash command in the project directory. Takes an array of command parts (e.g., ['ls', '-la', 'src'])",
  params: {
    command: {
      type: "array",
      items: { type: "string" },
      description:
        "Array of command parts to execute (e.g., ['ls', '-la', 'src'])",
    },
  },
  requiredParams: ["command"],
};
