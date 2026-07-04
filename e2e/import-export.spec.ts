import { readFile } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

import { addTask } from './helpers';

const NAME = 'Roundtrip task';
const CSV_HEADER =
  'id,name,description,categoryId,categoryName,createdAt,lastCompletedAt,frequencyValue,frequencyUnit,timeCommitment,isArchived,notes,instanceLabel,seriesId';

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

test('a series survives the JSON round-trip intact (Phase 1.1)', async ({ page }) => {
  await page.goto('/');
  await addTask(page, {
    name: 'Vacuum',
    time: '30 min',
    category: 'Bedroom',
    labels: ['Main', 'Guest'],
  });

  await page.goto('/settings');
  const dm = page.getByRole('region', { name: 'Data Management' });

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    dm.getByRole('button', { name: 'Export Data' }).click(),
  ]);
  const backup = await readFile(await download.path());
  expect(backup.toString()).toContain('seriesId');
  expect(backup.toString()).toContain('instanceLabel');

  await dm.getByRole('button', { name: 'Clear All Data' }).click();
  await page
    .getByRole('dialog', { name: 'Clear all data?' })
    .getByRole('button', { name: 'Clear All Data' })
    .click();
  await expect(page.getByText('All data cleared')).toBeVisible();

  await dm.locator('input[type="file"]').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: backup,
  });
  await page
    .getByRole('dialog', { name: 'Import this backup?' })
    .getByRole('button', { name: 'Import' })
    .click();
  await expect(page.getByText('Data restored')).toBeVisible();

  // The restored siblings still collapse into one group row.
  await page.goto('/category');
  await expect(page.getByRole('button', { name: /Vacuum.*2 places/ })).toBeVisible();
});

test('a pre-1.1 backup (no instanceLabel/seriesId) still imports (Phase 1.1 compat)', async ({
  page,
}) => {
  // Literal fixture matching the Phase 1 export shape — do not "modernize".
  const pre11 = JSON.stringify({
    app: 'how-long-since',
    schemaVersion: 2,
    exportedAt: '2026-07-02T00:00:00.000Z',
    data: {
      tasks: [
        {
          id: '22222222-2222-4222-8222-222222222222',
          name: 'Legacy task',
          description: '',
          categoryId: '4a2c1e91-df59-40c8-af6c-ae499c468cdf', // seeded Kitchen id
          createdAt: '2026-06-01T10:00:00.000Z',
          lastCompletedAt: null,
          timeCommitment: '15min',
          isArchived: false,
          notes: '',
        },
      ],
      categories: [
        {
          id: '4a2c1e91-df59-40c8-af6c-ae499c468cdf',
          name: 'Kitchen',
          color: '#3B82F6',
          icon: 'utensils',
          isDefault: true,
        },
      ],
      settings: {
        id: '1',
        lastBackupDate: null,
        currentView: 'quick',
        theme: 'system',
        textSize: 'default',
        highContrast: false,
        reducedMotion: false,
      },
    },
  });

  await page.goto('/settings');
  const dm = page.getByRole('region', { name: 'Data Management' });
  await dm.locator('input[type="file"]').setInputFiles({
    name: 'pre11-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(pre11),
  });
  await page
    .getByRole('dialog', { name: 'Import this backup?' })
    .getByRole('button', { name: 'Import' })
    .click();
  await expect(page.getByText('Data restored')).toBeVisible();

  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Mark Legacy task complete' })).toBeVisible();
});
