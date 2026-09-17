import { test, expect } from '@playwright/test';

test('root redirects to the organizer entry', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/org$/);
});

test('unknown routes show the not-found screen', async ({ page }) => {
  await page.goto('/nope');
  await expect(page.getByRole('heading', { name: 'Not part of this prototype' })).toBeVisible();
});

test('flows work with reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/org');
  await page.getByRole('button', { name: 'Start a party' }).click();
  await page.getByRole('button', { name: 'Your location' }).click();
  await page.getByRole('button', { name: 'Allow', exact: true }).click();
  await page.getByRole('button', { name: 'Use this location' }).click();
  await expect(page.getByText('within 2 mi')).toBeVisible();
  await context.close();
});
