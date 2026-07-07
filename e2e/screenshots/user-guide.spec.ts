import { expect, test } from '@playwright/test';

import { buildGuideBackup } from './fixture';

/**
 * Deterministic capture of the 12 screenshots embedded in docs/USER_GUIDE.md.
 * Run with `pnpm screenshots` (uses playwright.screenshots.config.ts: mobile
 * 390×844 @2x, light theme, reduced motion). The PNGs are committed.
 *
 * We seed through the app's own JSON Import flow — the exact production path
 * (Zod validation + date revival) — rather than poking IndexedDB directly, so a
 * schema drift fails here loudly. Dates in the fixture are relative to `now`, so
 * the overdue tiers land the same on every run.
 */

const OUT = 'public/images/user-guide';

test('capture user-guide screenshots', async ({ page }) => {
  const backup = buildGuideBackup(new Date());

  // --- Seed via Settings → Import (mirrors import-export.spec.ts) -----------
  await page.goto('/settings');
  const dm = page.getByRole('region', { name: 'Data Management' });
  await dm.locator('input[type="file"]').setInputFiles({
    name: 'user-guide-seed.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await page
    .getByRole('dialog', { name: 'Import this backup?' })
    .getByRole('button', { name: 'Import' })
    .click();
  await expect(page.getByText('Data restored')).toBeVisible();
  await page.reload(); // clear the toast so it never bleeds into a shot

  const shot = (name: string) =>
    page.screenshot({ path: `${OUT}/${name}`, animations: 'disabled' });

  // 1. Quick Wins — widen the filter to "2 hours" for a fuller ranked list.
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'How much time do you have?' })).toBeVisible();
  await page.getByRole('radio', { name: '2 hours' }).click();
  await expect(
    page.getByRole('button', { name: 'Mark Deep clean refrigerator complete' }),
  ).toBeVisible();
  await shot('quick-wins.png');

  // 2. Add Task — FAB → dialog, filled out.
  await page.getByRole('button', { name: 'Add task' }).click();
  const addDialog = page.getByRole('dialog');
  await expect(addDialog).toBeVisible();
  await addDialog.getByPlaceholder('What needs to be done?').fill('Descale coffee maker');
  await addDialog.getByRole('radio', { name: 'Kitchen', exact: true }).click();
  await addDialog.getByRole('radio', { name: '15 min', exact: true }).click();
  await addDialog.getByRole('spinbutton', { name: 'Frequency amount' }).fill('1');
  await addDialog.getByRole('radio', { name: 'Today', exact: true }).click();
  // Clicking the lower controls scrolled the modal down; return to the top so
  // the shot leads with the name + category (the modal scrolls internally, so no
  // single frame shows the whole form — this frames the "start here" half).
  await addDialog.evaluate((el) => el.scrollTo(0, 0));
  await shot('add-task.png');
  await page.keyboard.press('Escape');
  await expect(addDialog).toBeHidden();

  // 3. Track in multiple places — chips + category suggestions.
  await page.getByRole('button', { name: 'Add task' }).click();
  const placesDialog = page.getByRole('dialog');
  await placesDialog.getByPlaceholder('What needs to be done?').fill('Vacuum bedroom');
  await placesDialog.getByRole('radio', { name: 'Bedroom', exact: true }).click();
  await placesDialog.getByRole('radio', { name: '30 min', exact: true }).click();
  await placesDialog.getByRole('button', { name: 'Track in multiple places' }).click();
  // Suggestions are the labels already used in Bedroom (the series). Promote
  // two to chips, leaving the third as a suggestion.
  await placesDialog.getByRole('button', { name: 'Main bedroom' }).click();
  await placesDialog.getByRole('button', { name: 'Guest room' }).click();
  await expect(placesDialog.getByRole('button', { name: "Kids' room" })).toBeVisible();
  await shot('add-task-places.png');
  await page.keyboard.press('Escape');
  await expect(placesDialog).toBeHidden();

  // 4. By Category — color-dot headers + collapsed series row.
  await page.goto('/category');
  const seriesRow = page.getByRole('button', { name: /Vacuum bedroom.*3 places/ });
  await expect(seriesRow).toBeVisible();
  await shot('by-category.png');

  // 5. Series expanded — element shot of the whole group (header + per-place
  // cards), so the expanded siblings are all in frame regardless of scroll.
  await seriesRow.click();
  await expect(page.getByRole('button', { name: /Vacuum bedroom — Guest room complete/ })).toBeVisible();
  await seriesRow
    .locator('..')
    .screenshot({ path: `${OUT}/series-expanded.png`, animations: 'disabled' });

  // 6. Overdue states — element shot of the Kitchen group (due-soon + overdue +
  // very-overdue stacked). The group <div> is the grandparent of its heading.
  await seriesRow.click(); // collapse again so the shot stays tidy
  const kitchenGroup = page.getByRole('heading', { name: 'Kitchen' }).locator('../..');
  await kitchenGroup.screenshot({ path: `${OUT}/overdue-states.png`, animations: 'disabled' });

  // 7. By Time — buckets + tinted category tags.
  await page.goto('/time');
  await expect(page.getByRole('heading', { name: 'Quick tasks' })).toBeVisible();
  await shot('by-time.png');

  // 8. Edit task — label field + Remove Task zone (a series sibling shows a
  // populated "Where — or who?" field).
  await page.goto('/tasks/c0000000-0000-4000-8000-000000000013');
  await expect(page.getByRole('heading', { name: 'Edit Task' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Remove Task' })).toBeVisible();
  // Full-page: the edit form is taller than the viewport and we want both the
  // label field and the Remove Task zone in one image.
  await page.screenshot({ path: `${OUT}/edit-task.png`, fullPage: true, animations: 'disabled' });

  // 9. Manage Categories.
  await page.goto('/categories');
  await expect(page.getByRole('heading', { name: 'Categories' })).toBeVisible();
  await shot('categories.png');

  // 10. Settings — Appearance section (theme, text size, contrast, motion).
  await page.goto('/settings');
  const appearance = page.getByRole('region', { name: 'Appearance' });
  await expect(appearance).toBeVisible();
  await appearance.screenshot({ path: `${OUT}/settings.png`, animations: 'disabled' });

  // 11. Settings — Data Management section.
  await dm.scrollIntoViewIfNeeded();
  await dm.screenshot({ path: `${OUT}/settings-data.png`, animations: 'disabled' });

  // 12. Complete + Undo — captured LAST so its mutation can't affect other
  // shots. Fresh load resets the filter to 15 min.
  await page.goto('/');
  await page.getByRole('button', { name: 'Mark Descale coffee maker complete' }).click();
  await expect(page.getByText('Nice work! Updated Descale coffee maker')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible();
  await shot('complete-undo.png');
});
