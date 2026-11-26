import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'copy-extension-files',
      closeBundle() {
        try {
          const distDir = resolve(__dirname, 'dist');
          const iconsDistDir = resolve(distDir, 'icons');
          mkdirSync(iconsDistDir, { recursive: true });
          const manifestPath = resolve(__dirname, 'manifest.json');
          if (existsSync(manifestPath))
            copyFileSync(manifestPath, resolve(distDir, 'manifest.json'));
          for (const size of [16, 48, 128]) {
            const src = resolve(__dirname, `icons/icon${size}.png`);
            if (existsSync(src))
              copyFileSync(src, resolve(iconsDistDir, `icon${size}.png`));
          }
          console.log('✓ Extension files copied to dist/');
        } catch (e) {
          console.warn('copy-extension-files warning:', e);
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background.js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
