const { execSync } = require("node:child_process");

try {
  // Find modified and untracked files using git
  let modifiedFiles = [];
  try {
    const gitOutput = execSync(
      "git ls-files --modified --others --exclude-standard",
      { encoding: "utf8" }
    );
    modifiedFiles = gitOutput
      .trim()
      .split("\n")
      .filter((file) => file.length > 0);
  } catch (error) {
    console.error("Could not get modified files from git:", error.message);
    return;
  }

  if (modifiedFiles.length === 0) {
    console.log("No modified files found");
    return;
  }

  console.log(`Processing ${modifiedFiles.length} modified files`);

  for (const filePath of modifiedFiles) {
    console.log(`Processing: ${filePath}`);

    // Run Prettier on any file (it will skip unsupported files)
    try {
      execSync(`npm run format -- "${filePath}"`, { stdio: "inherit" });
    } catch (error) {
      console.error(`Prettier failed for ${filePath}:`, error.message);
    }

    // Check if it's a TypeScript/JavaScript file for ESLint
    if (/\.(ts|tsx|js|jsx)$/.test(filePath)) {
      try {
        // Run ESLint with --fix on the specific file
        execSync(`npm run lint -- --fix "${filePath}"`, { stdio: "inherit" });
      } catch (error) {
        console.error(`ESLint failed for ${filePath}:`, error.message);
      }
    }
  }
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
