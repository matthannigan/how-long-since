import { expect, test } from '@playwright/test';

import { addTask, waitForServiceWorker } from './helpers';

const NAME = 'Offline task';

test('works offline: SW registered, reads/writes persist across reload', async ({
  page,
  context,
}) => {
  await page.goto('/');
  // A service worker is registered and controls the page (the offline mechanism;
  // install-manifest.spec asserts its precache holds the shell + fonts). Playwright's
  // offline emulation blocks the SW from serving a top-level navigation, so the
  // offline *reload* itself can't be exercised here — but the on-device data path
  // (IndexedDB) needs no network and is fully verified below.
  await waitForServiceWorker(page);

  // Reads/writes work with no network — add + complete a task while offline.
  await context.setOffline(true);
  try {
    await addTask(page, { name: NAME });
    const completeBtn = page.getByRole('button', { name: `Mark ${NAME} complete` });
    await expect(completeBtn).toBeVisible();
    await completeBtn.click();
  } finally {
    await context.setOffline(false);
  }

  // The task added offline persists across a reload (IndexedDB is on-device).
  await page.reload();
  await expect(page.getByRole('button', { name: `Mark ${NAME} complete` })).toBeVisible();
});
