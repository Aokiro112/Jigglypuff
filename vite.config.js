import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // './' makes all asset paths relative — required for Electron (file:// protocol)
  base: './',
  server: { port: 5173 },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Pre-bundle music-metadata so Vite can resolve its CJS deps (e.g. 'debug')
  optimizeDeps: {
    include: ['zustand', 'idb', 'music-metadata'],
  },
  build: {
    target: 'esnext', // modern browsers, enables top-level await
    rollupOptions: {
      output: {
        // Manual chunk splitting to keep initial bundle small
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react') || id.includes('react-dom')) return 'vendor';
          if (id.includes('zustand')) return 'state';
          if (id.includes('idb')) return 'db';
          return undefined;
        },
      },
    },
  },
});
