import { expect, test } from '@playwright/test';

import { addTask } from './helpers';

const COMPLETE = /^Mark .+ complete$/;

test('Quick Wins caps results at 8 and supports complete + undo', async ({ page }) => {
  await page.goto('/');

  // Nine 15-minute tasks — one more than QUICK_PICK_LIMIT (8).
  for (let i = 1; i <= 9; i++) {
    await addTask(page, { name: `Quick task ${i}`, time: '15 min' });
  }

  // Pick a time window; every 15-minute task fits, so the cap (8) applies.
  await page.getByRole('radio', { name: '1 hour', exact: true }).click();
  await expect(page.getByRole('button', { name: COMPLETE })).toHaveCount(8);

  // Complete one from the view, then undo from the toast.
  await page.getByRole('button', { name: COMPLETE }).first().click();
  const undo = page.getByRole('button', { name: 'Undo' });
  await expect(undo).toBeVisible();
  await undo.click();

  // Still capped at 8 after the round-trip.
  await expect(page.getByRole('button', { name: COMPLETE })).toHaveCount(8);
});
