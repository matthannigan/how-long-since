import { expect, test } from '@playwright/test';

import { addTask } from './helpers';

const NAME = 'Water the ferns';

test('create → complete → undo → archive', async ({ page }) => {
  await page.goto('/');

  // Create — a 15 min task shows in Quick Wins (the default view + default window).
  await addTask(page, { name: NAME });
  const completeBtn = page.getByRole('button', { name: `Mark ${NAME} complete` });
  await expect(completeBtn).toBeVisible();

  // Complete, then undo from the toast (within the 5s window).
  await completeBtn.click();
  const undo = page.getByRole('button', { name: 'Undo' });
  await expect(undo).toBeVisible();
  await undo.click();
  // Still present after undo.
  await expect(completeBtn).toBeVisible();

  // Open the task and archive it; goBack returns us to the list.
  await page.getByRole('link', { name: new RegExp(NAME) }).click();
  await expect(page).toHaveURL(/\/tasks\//);
  await page.getByRole('button', { name: 'Archive' }).click();

  // Archived tasks leave the list.
  await expect(page.getByRole('button', { name: `Mark ${NAME} complete` })).toHaveCount(0);
});
