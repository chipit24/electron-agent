import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        inlineDynamicImports: false,
        entryFileNames: "[name]/preload.js",
      },
      input: {
        main: resolve(__dirname, "src/main/preload.ts"),
        settings: resolve(__dirname, "src/settings/preload.ts"),
      },
    },
  },
});
