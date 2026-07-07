import { expect, test } from '@playwright/test';

import { waitForServiceWorker } from './helpers';

/**
 * The served user guide (public/user-guide.html), generated from
 * docs/USER_GUIDE.md. These run against the production preview build, so they
 * also 404-guard the committed artifact's existence.
 */

test('the guide is served with the right title', async ({ request }) => {
  const res = await request.get('/user-guide.html');
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain('<title>How Long Since — User Guide</title>');
});

test('the guide loads even after the service worker controls the page', async ({ page }) => {
  // The real regression test for workbox `navigateFallbackDenylist`: once the SW
  // is active, a bare navigation to /user-guide.html must render the guide, not
  // the SPA shell that the NavigationRoute would otherwise serve.
  await page.goto('/');
  await waitForServiceWorker(page);

  await page.goto('/user-guide.html');
  await expect(page.getByRole('heading', { level: 1, name: /User Guide/ })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Contents' })).toBeVisible();
});

test('Settings links to the guide', async ({ page }) => {
  await page.goto('/settings');
  const link = page.getByRole('link', { name: 'User Guide' });
  await expect(link).toHaveAttribute('href', '/user-guide.html');
  await expect(link).toHaveAttribute('target', '_blank');
});
