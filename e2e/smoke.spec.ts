import { expect, test } from '@playwright/test';

test('app shell renders the title', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'How Long Since' })).toBeVisible();
});
