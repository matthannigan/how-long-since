import { defineConfig, devices } from '@playwright/test';

// https://playwright.dev/docs/test-configuration
export default defineConfig({
  testDir: './e2e',
  // The screenshot-capture spec has its own config (playwright.screenshots.config.ts,
  // run via `pnpm screenshots`) — keep it out of the recursive ./e2e sweep.
  testIgnore: 'screenshots/**',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // E2E runs against the production preview build, not the dev server: the
  // service worker is only registered in a real build (devOptions.enabled: false),
  // the offline spec needs it, and the DEV-only sample seed does NOT run — so each
  // test starts from a clean, deterministic DB (10 categories + settings, no tasks).
  webServer: {
    command: 'pnpm build && pnpm preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
