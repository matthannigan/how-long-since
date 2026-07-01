import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // The router plugin must run before @vitejs/plugin-react.
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Minimal manifest for the dev dry-run. Icons + offline verification are Step 9.
      // theme_color is the Soft Daylight page surface (design.md's #2563eb is stale).
      manifest: {
        name: 'How Long Since',
        short_name: 'HowLongSince',
        theme_color: '#FAF8F4',
        background_color: '#FAF8F4',
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    // Keep Playwright specs (e2e/) out of the Vitest run.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
