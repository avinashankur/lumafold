import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, mkdirSync, existsSync } from "fs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "copy-extension-files",
      closeBundle() {
        try {
          mkdirSync("dist/icons", { recursive: true });
          if (existsSync("manifest.json")) copyFileSync("manifest.json", "dist/manifest.json");
          if (existsSync("background.js")) copyFileSync("background.js", "dist/background.js");
          for (const size of [16, 48, 128]) {
            const src = `icons/icon${size}.png`;
            if (existsSync(src)) copyFileSync(src, `dist/icons/icon${size}.png`);
          }
          console.log("✓ Extension files copied to dist/");
        } catch (e) {
          console.warn("copy-extension-files warning:", e);
        }
      },
    },
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
      },
    },
  },
});
