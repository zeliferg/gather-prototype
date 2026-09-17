import { test, expect } from '@playwright/test';

test('organizer spine: landing to the morning after', async ({ page }) => {
  await page.goto('/org');
  await page.getByRole('button', { name: 'Start a party' }).click();
  await page.getByRole('button', { name: 'Your location' }).click();
  await page.getByRole('button', { name: 'Allow', exact: true }).click();
  await page.getByRole('button', { name: '5 mi' }).click();
  await page.getByRole('button', { name: 'Use this location' }).click();
  await expect(page.getByText('within 5 mi')).toBeVisible();
  await page.getByRole('button', { name: 'Create party' }).click();
  await page.getByRole('link', { name: 'gather.app/m/9k2p1' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: "Jordan's Dinner" })).toBeVisible();
  await page.getByRole('button', { name: 'See everyone', exact: true }).click();
  await page.getByRole('button', { name: 'Remind', exact: true }).first().click();
  await expect(page.getByText('Reminder sent')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click({ position: { x: 10, y: 10 } }); // scrim centre is under the sheet panel
  await page.getByRole('button', { name: "Remind the 2 who haven't" }).click();
  await expect(page.getByRole('heading', { name: "Everyone's in" })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Browse places' }).click();
  await page.getByRole('tab', { name: 'Map' }).click();
  await page.getByRole('button', { name: 'Corner Table' }).click();
  await expect(page.getByRole('dialog', { name: 'Corner Table' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click({ position: { x: 10, y: 10 } }); // scrim centre is under the sheet panel
  await page.getByRole('tab', { name: 'List' }).click();
  await page.getByRole('button', { name: 'Tavola Verde' }).click();
  await page.getByRole('button', { name: 'Book 7:00 PM with [Partner]' }).click();
  await page.getByRole('button', { name: 'Book 7:00 PM', exact: true }).click();
  await expect(page.getByRole('heading', { name: "You're all set" })).toBeVisible();
  await page.getByRole('button', { name: 'Back to the party' }).click();
  await page.getByRole('link', { name: /morning after/ }).click();
  await expect(page.getByText('Thanks for hosting')).toBeVisible();
});
