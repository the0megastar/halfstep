import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';

function swVersionPlugin(): Plugin {
  return {
    name: 'sw-version-plugin',
    closeBundle() {
      const swDistPath = path.resolve(__dirname, 'dist/sw.js');
      if (fs.existsSync(swDistPath)) {
        const content = fs.readFileSync(swDistPath, 'utf8');
        const updated = content.replace(/__BUILD_HASH__/g, Date.now().toString());
        fs.writeFileSync(swDistPath, updated, 'utf8');
      }
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), swVersionPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
