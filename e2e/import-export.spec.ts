import { readFile } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

import { addTask } from './helpers';

const NAME = 'Roundtrip task';
const CSV_HEADER =
  'id,name,description,categoryId,categoryName,createdAt,lastCompletedAt,frequencyValue,frequencyUnit,timeCommitment,isArchived,notes';

test('JSON export → clear → import round-trip restores the task; CSV export is valid', async ({
  page,
}) => {
  await page.goto('/');
  await addTask(page, { name: NAME });

  await page.goto('/settings');

  // Scope to the Data Management section — the backup-reminder banner also has an
  // "Export Data" button when no backup exists yet.
  const dm = page.getByRole('region', { name: 'Data Management' });

  // Export the full JSON backup and capture its contents.
  const [jsonDownload] = await Promise.all([
    page.waitForEvent('download'),
    dm.getByRole('button', { name: 'Export Data' }).click(),
  ]);
  expect(jsonDownload.suggestedFilename()).toMatch(
    /^how-long-since-backup-\d{4}-\d{2}-\d{2}\.json$/,
  );
  const jsonPath = await jsonDownload.path();
  const backup = await readFile(jsonPath);
  expect(backup.toString()).toContain(NAME);

  // Clear everything (the danger-zone button, then the confirm dialog's button).
  await dm.getByRole('button', { name: 'Clear All Data' }).click();
  const clearDialog = page.getByRole('dialog', { name: 'Clear all data?' });
  await clearDialog.getByRole('button', { name: 'Clear All Data' }).click();
  await expect(page.getByText('All data cleared')).toBeVisible();

  // Re-import the captured backup via the hidden file input.
  await dm.locator('input[type="file"]').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: backup,
  });
  const importDialog = page.getByRole('dialog', { name: 'Import this backup?' });
  await importDialog.getByRole('button', { name: 'Import' }).click();
  await expect(page.getByText('Data restored')).toBeVisible();

  // CSV export is export-only: assert filename, header row, and the task name.
  const [csvDownload] = await Promise.all([
    page.waitForEvent('download'),
    dm.getByRole('button', { name: 'Export CSV' }).click(),
  ]);
  expect(csvDownload.suggestedFilename()).toMatch(/^how-long-since-tasks-\d{4}-\d{2}-\d{2}\.csv$/);
  const csv = (await readFile(await csvDownload.path())).toString();
  expect(csv.split(/\r?\n/)[0].trim()).toBe(CSV_HEADER);
  expect(csv).toContain(NAME);

  // The imported task is back in the list.
  await page.goto('/');
  await expect(page.getByRole('button', { name: `Mark ${NAME} complete` })).toBeVisible();
});
