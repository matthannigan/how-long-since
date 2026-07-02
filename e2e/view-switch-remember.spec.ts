import { expect, test } from '@playwright/test';

import { waitForCurrentView } from './helpers';

test('lands on Quick Wins by default, switches all three views, and remembers on reopen', async ({
  page,
}) => {
  // Fresh install → Quick Wins is the default (currentView defaults to 'quick').
  await page.goto('/');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('link', { name: 'Quick Wins' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  // Switch to By Category.
  await page.getByRole('link', { name: 'By Category' }).click();
  await expect(page).toHaveURL(/\/category$/);
  await expect(page.getByRole('link', { name: 'By Category' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  // Switch to By Time.
  await page.getByRole('link', { name: 'By Time' }).click();
  await expect(page).toHaveURL(/\/time$/);
  await expect(page.getByRole('link', { name: 'By Time' })).toHaveAttribute('aria-current', 'page');

  // Reopening the app at "/" restores the last-selected view (remember-view).
  // Wait for the async write to commit so the reload's redirect reads it.
  await waitForCurrentView(page, 'time');
  await page.goto('/');
  await expect(page).toHaveURL(/\/time$/);
  await expect(page.getByRole('link', { name: 'By Time' })).toHaveAttribute('aria-current', 'page');
});
