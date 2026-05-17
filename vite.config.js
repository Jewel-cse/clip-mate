import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, 'src/renderer'), // Change Vite's root to the renderer folder
  base: './', // Use relative paths for built assets so Electron can find them locally
  build: {
    outDir: resolve(__dirname, 'src/renderer/dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
