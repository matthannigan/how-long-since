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
      // Icon set (192/512 + maskable, apple-touch, favicon) is generated from
      // public/favicon.svg via pwa-assets.config.ts; the plugin auto-injects the
      // manifest `icons` entry and the html <link> tags. injectThemeColor is off
      // because index.html already declares the theme-color meta.
      pwaAssets: { config: true, injectThemeColor: false },
      // theme_color is the Soft Daylight page surface (design.md's #2563eb is stale).
      manifest: {
        name: 'How Long Since',
        short_name: 'HowLongSince',
        description: "Track how long it's been since you last did something.",
        theme_color: '#FAF8F4',
        background_color: '#FAF8F4',
      },
      // Default globPatterns miss woff2, so the self-hosted fonts wouldn't be
      // precached and the first offline paint would lose the type system.
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,ico,webmanifest}'],
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
    // Tooling (e.g. editor preview harnesses) may assign a port via PORT;
    // humans still get the 5173 default.
    port: Number(process.env.PORT) || 5173,
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
