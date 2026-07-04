import { expect, test } from '@playwright/test';

import { addTask } from './helpers';

/**
 * Phase 1.1 (Instances & Series) end-to-end flows, driven entirely through the
 * real UI against the production preview build (clean DB — the dev seed never
 * runs here, so every test creates its own data via the form).
 */

const LABELS = ['Main', 'Guest', 'Kids'];

test('fan-out: one submission creates a series that collapses in By Category', async ({ page }) => {
  await page.goto('/');
  await addTask(page, { name: 'Vacuum', time: '30 min', category: 'Bedroom', labels: LABELS });

  // One toast for the whole batch.
  await expect(page.getByText('3 tasks added')).toBeVisible();

  await page.getByRole('link', { name: 'By Category' }).click();

  const groupRow = page.getByRole('button', { name: /Vacuum.*3 places/ });
  await expect(groupRow).toBeVisible();
  await expect(groupRow).toHaveAttribute('aria-expanded', 'false');

  // Expand → three labeled sibling cards, alphabetical by label.
  await groupRow.click();
  await expect(groupRow).toHaveAttribute('aria-expanded', 'true');
  const instances = page.getByRole('group', { name: 'Vacuum instances' });
  await expect(instances.getByRole('link')).toHaveCount(3);
  await expect(instances.getByText('Guest', { exact: true })).toBeVisible();
  await expect(instances.getByText('Kids', { exact: true })).toBeVisible();
  await expect(instances.getByText('Main', { exact: true })).toBeVisible();
});

test('suggestions offer labels already used in the category and follow category switches', async ({
  page,
}) => {
  await page.goto('/');
  await addTask(page, { name: 'Vacuum', time: '30 min', category: 'Bedroom', labels: LABELS });

  // Second Bedroom task: previously used labels come back as suggestions.
  await page.getByRole('button', { name: 'Add task' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByPlaceholder('What needs to be done?').fill('Dust shelves');
  await dialog.getByRole('radio', { name: 'Bedroom', exact: true }).click();
  await dialog.getByRole('button', { name: 'Track in multiple places' }).click();

  const suggestions = dialog.getByRole('group', { name: 'Suggestions' });
  await expect(suggestions.getByRole('button', { name: /Guest/ })).toBeVisible();
  await expect(suggestions.getByRole('button', { name: /Main/ })).toBeVisible();

  // Switching category empties the pool (Kitchen has no labeled tasks).
  await dialog.getByRole('radio', { name: 'Kitchen', exact: true }).click();
  await expect(suggestions).toHaveCount(0);

  // Tapping a suggestion turns it into a chip.
  await dialog.getByRole('radio', { name: 'Bedroom', exact: true }).click();
  await dialog
    .getByRole('group', { name: 'Suggestions' })
    .getByRole('button', { name: /Guest/ })
    .click();
  await expect(dialog.getByRole('button', { name: 'Remove Guest' })).toBeVisible();
});

test('complete + undo works on a sibling inside an expanded group', async ({ page }) => {
  await page.goto('/');
  await addTask(page, { name: 'Vacuum', time: '30 min', category: 'Bedroom', labels: LABELS });

  await page.getByRole('link', { name: 'By Category' }).click();
  await page.getByRole('button', { name: /Vacuum.*3 places/ }).click();

  const instances = page.getByRole('group', { name: 'Vacuum instances' });
  const guestCard = instances.getByRole('link', { name: /Guest/ });
  await expect(guestCard).toContainText('New'); // never completed

  await page.getByRole('button', { name: 'Mark Vacuum — Guest complete' }).click();
  await expect(page.getByText('Nice work! Updated Vacuum — Guest')).toBeVisible();
  await expect(guestCard).not.toContainText('New');

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(guestCard).toContainText('New'); // prior (null) restored
});

test('By Time collapses the series while Quick Wins lists siblings individually', async ({
  page,
}) => {
  await page.goto('/');
  await addTask(page, { name: 'Vacuum', time: '30 min', category: 'Bedroom', labels: LABELS });

  await page.getByRole('link', { name: 'By Time' }).click();
  await expect(page.getByRole('button', { name: /Vacuum.*3 places/ })).toBeVisible();
  // The section header keeps task semantics: 3 tasks in the 30-min section.
  await expect(page.getByText('30 min · 3')).toBeVisible();

  await page.getByRole('link', { name: 'Quick Wins' }).click();
  await page.getByRole('radio', { name: '30 min' }).click();
  const main = page.getByRole('main');
  // No group rows here — each sibling is its own row with its label chip.
  await expect(main.getByRole('button', { name: /places/ })).toHaveCount(0);
  await expect(main.getByRole('link', { name: /Vacuum/ })).toHaveCount(3);
});

test('the group row is fully keyboard-operable', async ({ page }) => {
  await page.goto('/');
  await addTask(page, { name: 'Vacuum', time: '30 min', category: 'Bedroom', labels: LABELS });

  await page.getByRole('link', { name: 'By Category' }).click();
  const groupRow = page.getByRole('button', { name: /Vacuum.*3 places/ });
  await groupRow.focus();

  await page.keyboard.press('Enter');
  await expect(groupRow).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Space');
  await expect(groupRow).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Enter');

  // Tab from the row reaches the first sibling's completion checkbox.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Mark Vacuum — Guest complete' })).toBeFocused();
});
