import { defineConfig } from '@vite-pwa/assets-generator/config';

// Generates the PWA icon set (192/512 "any" + maskable, apple-touch, favicon)
// from a single source SVG. vite.config.ts references this via `pwaAssets.config`,
// so the plugin auto-injects the manifest `icons` entry and the html `<link>` tags.
//
// minimal2023Preset, adjusted: the source SVG is full-bleed on the Soft Daylight
// page color, so "any"/apple icons take no padding, and the maskable variant pads
// with the same #FAF8F4 (the preset default pads 30% on white, which left the mark
// floating in a mismatched white frame under Android's circle crop).
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    transparent: {
      sizes: [64, 192, 512],
      favicons: [[48, 'favicon.ico']],
      padding: 0,
    },
    maskable: {
      sizes: [512],
      // 0.15 keeps the enlarged mark (hand tip reaches ~90% of the art's
      // half-width) inside the 80% circle-crop safe zone.
      padding: 0.15,
      resizeOptions: { background: '#FAF8F4' },
    },
    apple: {
      sizes: [180],
      padding: 0,
      resizeOptions: { background: '#FAF8F4' },
    },
  },
  images: ['public/favicon.svg'],
});
