import { test, expect } from '@playwright/test';

test('root redirects to the organizer entry', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/org$/);
});

test('unknown routes show the not-found screen', async ({ page }) => {
  await page.goto('/nope');
  await expect(page.getByRole('heading', { name: 'Not part of this prototype' })).toBeVisible();
});
