import { expect, test } from '@playwright/test';

import { waitForServiceWorker } from './helpers';

interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}
interface WebManifest {
  name: string;
  short_name: string;
  display: string;
  theme_color: string;
  description?: string;
  icons: ManifestIcon[];
}

test('is installable: manifest, icons, and a registered service worker', async ({
  page,
  request,
}) => {
  await page.goto('/');

  // The manifest is linked from the document head.
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    'href',
    /manifest\.webmanifest/,
  );

  // Manifest content meets the install preconditions.
  const manifest = (await (await request.get('/manifest.webmanifest')).json()) as WebManifest;
  expect(manifest.name).toBe('How Long Since');
  expect(manifest.short_name).toBe('HowLongSince');
  expect(manifest.display).toBe('standalone');
  expect(manifest.theme_color).toBe('#FAF8F4');
  expect(manifest.description).toBeTruthy();

  const iconKinds = manifest.icons.map((icon) => `${icon.sizes} ${icon.purpose ?? 'any'}`);
  expect(iconKinds).toContain('192x192 any');
  expect(iconKinds).toContain('512x512 any');
  expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true);

  // Every declared icon URL actually resolves.
  for (const icon of manifest.icons) {
    const res = await request.get(`/${icon.src}`);
    expect(res.ok(), `${icon.src} should resolve`).toBeTruthy();
  }

  // A service worker registers and controls the page.
  await waitForServiceWorker(page);

  // Its Workbox precache covers the app shell and the self-hosted fonts, so the
  // installed PWA loads fully offline (the default globPatterns miss woff2 — this
  // guards that regression).
  const sw = await (await request.get('/sw.js')).text();
  expect(sw).toContain('index.html');
  expect(sw).toMatch(/\.woff2/);
});
