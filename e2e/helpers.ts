import { expect, type Page } from '@playwright/test';

/** The Dexie database name (see src/lib/db/schema.ts). */
export const DB_NAME = 'HowLongSinceDB';

/**
 * Wait until a service worker actually controls the page. Must be awaited before
 * going offline — going offline before the SW controls the page is the #1 source
 * of flake for the offline spec. The generated SW uses skipWaiting/clientsClaim,
 * so the controller appears without a manual reload.
 */
export async function waitForServiceWorker(page: Page): Promise<void> {
  await page.waitForFunction(
    async () => {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      return Boolean(reg && navigator.serviceWorker.controller);
    },
    undefined,
    { timeout: 20_000 },
  );
}

/**
 * Delete the app's IndexedDB and reload — a clean slate mid-test. Not needed for
 * isolation between tests (Playwright gives each test a fresh context), but handy
 * for the export → clear → import round-trip where we clear within one test.
 */
export async function clearIndexedDb(page: Page): Promise<void> {
  await page.evaluate(
    (name) =>
      new Promise<void>((resolve, reject) => {
        const req = indexedDB.deleteDatabase(name);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        // A blocked delete still resolves once connections close on reload.
        req.onblocked = () => resolve();
      }),
    DB_NAME,
  );
  await page.reload();
}

/**
 * Wait until the persisted `AppSettings.currentView` reaches `value`. The view
 * toggle writes it to IndexedDB asynchronously (fire-and-forget), and the
 * remember-view redirect reads it on the next load — so a reload must wait for
 * the write to commit or it races.
 */
export async function waitForCurrentView(page: Page, value: string): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(
        (name) =>
          new Promise<string | null>((resolve) => {
            const open = indexedDB.open(name);
            open.onerror = () => resolve(null);
            open.onsuccess = () => {
              const database = open.result;
              try {
                const store = database.transaction('settings', 'readonly').objectStore('settings');
                const get = store.get('1');
                get.onsuccess = () => {
                  const view = (get.result?.currentView as string) ?? null;
                  database.close();
                  resolve(view);
                };
                get.onerror = () => {
                  database.close();
                  resolve(null);
                };
              } catch {
                database.close();
                resolve(null);
              }
            };
          }),
        DB_NAME,
      ),
    )
    .toBe(value);
}

/**
 * Drive the Add-Task flow through the UI: FAB → dialog → fill name (+ optional
 * time estimate) → Save. The category defaults to the first/last-used one, so a
 * name is enough to make the form valid. Pass `time: null` to skip the estimate.
 * Pass `category` to pick a specific one, and `labels` to fan out a series via
 * "Track in multiple places" (Phase 1.1) — one task is created per label.
 */
export async function addTask(
  page: Page,
  {
    name,
    time = '15 min',
    category,
    labels,
  }: { name: string; time?: string | null; category?: string; labels?: string[] },
): Promise<void> {
  await page.getByRole('button', { name: 'Add task' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByPlaceholder('What needs to be done?').fill(name);
  if (category) await dialog.getByRole('radio', { name: category, exact: true }).click();
  if (time) await dialog.getByRole('radio', { name: time, exact: true }).click();
  if (labels?.length) {
    await dialog.getByRole('button', { name: 'Track in multiple places' }).click();
    const input = dialog.getByLabel('Where — or who?');
    for (const label of labels) {
      await input.fill(label);
      await input.press('Enter');
    }
  }
  await dialog.getByRole('button', { name: 'Save task' }).click();
  await expect(dialog).toBeHidden();
}
