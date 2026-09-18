import { test, expect } from '@playwright/test';

test('participant spine: invite to the morning after, including dropping out and rejoining', async ({ page }) => {
  await page.goto('/p');
  await page.getByRole('link', { name: 'gather.app/p/7k3m9' }).click();
  await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled(); // until the code is in
  await page.getByLabel('6-digit code').click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: "Jordan's Dinner" })).toBeVisible();
  await page.getByRole('button', { name: 'Join the party' }).click();
  await page.getByRole('button', { name: 'Allow', exact: true }).click();
  await page.getByRole('tab', { name: 'Drop a pin' }).click();
  await page.getByRole('button', { name: '1 mi', exact: true }).click();
  await page.getByRole('button', { name: 'Count me in' }).click();
  await expect(page.getByText("You're in")).toBeVisible();
  await expect(page.getByText('RiNo, within 1 mi.')).toBeVisible();
  await page.getByRole('link', { name: /books a spot/ }).click();
  await page.getByRole('link', { name: 'gather.app/p/7k3m9' }).click();
  await expect(page.getByRole('heading', { name: 'Tavola Verde' })).toBeVisible();
  await page.getByRole('button', { name: 'Directions', exact: true }).click();
  await page.getByRole('button', { name: 'Google Maps' }).click();
  await page.getByRole('button', { name: 'Add to calendar', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'See everyone', exact: true }).click();
  await expect(page.getByText('5 people, including you')).toBeVisible();
  // The sheet's scrim spans the viewport but the sheet panel visually covers its centre; click a corner so the scrim (not the panel) receives the click.
  await page.getByRole('button', { name: 'Close' }).click({ position: { x: 10, y: 10 } });
  await page.getByRole('button', { name: "Can't make it? Let Jordan know" }).click();
  await page.getByRole('button', { name: "I can't make it" }).click();
  await expect(page.getByText("You're out")).toBeVisible();
  await page.getByRole('button', { name: 'Changed your mind? Rejoin' }).click();
  await expect(page.getByRole('heading', { name: 'Tavola Verde' })).toBeVisible();
  await page.getByRole('link', { name: /morning after/ }).click();
  await expect(page.getByText('It was a blast!')).toBeVisible();
});
