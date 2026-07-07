import { defineConfig } from '@playwright/test';

/**
 * Screenshot-capture config, separate from playwright.config.ts on purpose:
 * the main config's `testDir: './e2e'` is recursive, so making this a second
 * *project* there would pull the capture spec into every `pnpm e2e` run. Kept
 * standalone and pointed at ./e2e/screenshots (which the main config ignores),
 * it only runs via `pnpm screenshots`.
 *
 * Emulates the primary target: a mobile viewport at 2× for crisp PNGs, forced
 * light theme, reduced motion. Single worker, no retries — deterministic.
 */
export default defineConfig({
  testDir: './e2e/screenshots',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  // Mobile emulation lives in the global `use` (a project-level `...devices[…]`
  // spread would override viewport/isMobile). `isMobile` is Chromium-only, which
  // is the default browser, so no browser override is needed.
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: 'light',
    // `reducedMotion` isn't a top-level `use` shortcut in this Playwright
    // version — it lives on contextOptions.
    contextOptions: { reducedMotion: 'reduce' },
  },
  projects: [{ name: 'chromium' }],
  // Same production preview the e2e suite uses — the SW registers, the dev-only
  // sample seed does not run, so the DB starts clean and our fixture is the
  // only data.
  webServer: {
    command: 'pnpm build && pnpm preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
