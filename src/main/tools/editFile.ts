import { readFile, writeFile, mkdir, unlink, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, basename } from "node:path";
import { app } from "electron";
import { execSync } from "node:child_process";
import type { Tool } from "../conversation";

const pendingEdits = new Map<
  string,
  { tempFilePath: string; originalFilePath: string }
>();

export const tool: Tool<{
  filePath: string;
  newContent: string;
  apply?: boolean;
}> = async ({ projectRoot, filePath, newContent, apply = false }) => {
  const fullFilePath = join(projectRoot, filePath);

  /* Check if this is an apply operation */
  if (apply) {
    const pendingEdit = pendingEdits.get(fullFilePath);

    if (!pendingEdit) {
      return JSON.stringify({
        error: "No pending edit found for this file",
      });
    }

    try {
      /* Apply the changes by copying temp file to original location */
      await copyFile(pendingEdit.tempFilePath, pendingEdit.originalFilePath);

      /* Clean up temp file */
      await unlink(pendingEdit.tempFilePath);
      pendingEdits.delete(fullFilePath);

      return JSON.stringify({
        message: `Successfully applied changes to ${filePath}`,
        applied: true,
      });
    } catch (error) {
      /* Clean up temp file even if apply failed */
      try {
        await unlink(pendingEdit.tempFilePath);
      } catch {
        // Ignore cleanup errors
      }
      pendingEdits.delete(fullFilePath);

      return JSON.stringify({
        error: `Failed to apply changes: ${error}`,
      });
    }
  }

  /* Initial edit operation - create diff and prepare for approval */
  try {
    /* Check if file exists */
    if (!existsSync(fullFilePath)) {
      return JSON.stringify({
        error: `File does not exist: ${filePath}`,
      });
    }

    /* Read original file */
    const originalContent = await readFile(fullFilePath, "utf8");

    /* Create temp directory in system temp */
    const tempDir = join(app.getPath("temp"), "temp-edits");
    await mkdir(tempDir, { recursive: true });

    /* Create temp file with timestamp to avoid conflicts */
    const timestamp = Date.now();
    const tempFileName = `${basename(filePath)}.${timestamp}.tmp`;
    const tempFilePath = join(tempDir, tempFileName);

    /* Write new content to temp file */
    await writeFile(tempFilePath, newContent, "utf8");

    /* Generate diff using git */
    let diffOutput: string;
    try {
      diffOutput = execSync(
        `git diff --no-index --no-prefix "${fullFilePath}" "${tempFilePath}"`,
        { cwd: projectRoot, encoding: "utf8" }
      );
    } catch (error) {
      const err = error as { stdout?: string };
      /* git diff returns non-zero exit code when files differ, which is expected */
      if (err.stdout) {
        diffOutput = err.stdout;
      } else {
        /* Fallback to basic diff if git fails */
        diffOutput = `--- ${filePath}\n+++ ${filePath} (modified)\n\nOriginal content:\n${originalContent}\n\nNew content:\n${newContent}`;
      }
    }

    /* Store pending edit info */
    pendingEdits.set(fullFilePath, {
      tempFilePath,
      originalFilePath: fullFilePath,
    });

    return JSON.stringify({
      message: `Prepared edit for ${filePath}. Review the diff and approve to apply changes.`,
      diff: diffOutput,
      filePath,
      requiresApproval: true,
      pendingEdit: true,
    });
  } catch (error) {
    return JSON.stringify({
      error: `Failed to prepare edit: ${error}`,
    });
  }
};

export const metadata = {
  name: "editFile",
  description:
    "Edit a file with diff preview and approval. First call creates a diff for approval, second call with apply=true applies the changes.",
  params: {
    filePath: {
      type: "string",
      description: "Path to the file to edit (relative to project root)",
    },
    newContent: {
      type: "string",
      description: "New content for the file",
    },
    apply: {
      type: "boolean",
      description:
        "Set to true to apply previously prepared changes (used after approval)",
    },
  },
  requiredParams: ["filePath", "newContent"],
};
