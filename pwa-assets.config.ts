import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Generates the PWA icon set (192/512 "any" + maskable, apple-touch, favicon)
// from a single source SVG. vite.config.ts references this via `pwaAssets.config`,
// so the plugin auto-injects the manifest `icons` entry and the html `<link>` tags.
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: minimal2023Preset,
  images: ['public/favicon.svg'],
});
