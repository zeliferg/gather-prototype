import { test, expect } from '@playwright/test';

test('participant spine: invite to the morning after, including dropping out and rejoining', async ({ page }) => {
  test.setTimeout(60_000); // the booking arrives on its own 15s after joining
  await page.goto('/p');
  await page.getByRole('link', { name: 'gather.app/p/7k3m9' }).click();

  // P 3 (before joining) comes first; verifying happens on the way to joining.
  await expect(page.getByRole('heading', { name: "Jordan's Dinner" })).toBeVisible();
  await expect(page.getByText('Names show once you join')).toBeVisible();
  await page.getByRole('button', { name: 'Verify and join' }).click();
  await expect(page.getByRole('heading', { name: "Verify it's you" })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled(); // until the code is in
  await page.getByLabel('6-digit code').click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // The join screen: location first (permission dialog, then the map screen with Save), preferences optional.
  await expect(page.getByRole('heading', { name: "Join Jordan's Dinner" })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Join the party' })).toBeDisabled();
  await page.getByRole('button', { name: 'My location' }).click();
  await expect(page.getByRole('alertdialog', { name: 'Location permission' })).toBeVisible();
  await page.getByRole('button', { name: 'Allow', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Where are you coming from?' })).toBeVisible();
  await page.getByRole('tab', { name: 'Drop a pin' }).click();
  await page.getByRole('button', { name: '1 mi', exact: true }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('heading', { name: "Join Jordan's Dinner" })).toBeVisible();
  await expect(page.getByText('RiNo · within 1 mi')).toBeVisible();
  await page.getByRole('button', { name: 'Preferences (optional)' }).click();
  await page.getByRole('button', { name: 'Vegetarian' }).click();
  await page.getByRole('button', { name: 'Save preferences' }).click();
  await page.getByRole('button', { name: 'Join the party' }).click();
  await expect(page.getByRole('button', { name: /Joining|You're in/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: "Jordan's Dinner" })).toBeVisible({ timeout: 5000 });
  await expect(page.getByText("You're in")).toBeVisible();
  await expect(page.getByText('RiNo, within 1 mi. Vegetarian.')).toBeVisible();
  await expect(page.getByRole('heading', { name: "Who's coming" })).toBeVisible();

  // P 3b's Edit opens the same screen in edit mode.
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your info' })).toBeVisible();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText("You're in")).toBeVisible();

  // The host books on its own ~15s after joining: banner on whatever screen, page flips to Booked.
  await expect(page.getByRole('status')).toContainText("You're all set", { timeout: 25_000 });
  await expect(page.getByText('Booked')).toBeVisible();
  await page.getByRole('status').click();
  await expect(page.getByRole('heading', { name: 'Jordan booked a spot' })).toBeVisible();
  await page.getByRole('button', { name: 'View the details' }).click();

  // P 3b with the restaurant drawer open (P 9's content lives in this drawer now).
  const details = page.getByRole('dialog', { name: 'Tavola Verde' });
  await expect(details).toBeVisible();
  await expect(details.getByText('Booked under Jordan')).toBeVisible();
  // The sheet's scrim spans the viewport but the sheet panel visually covers its centre; click a corner so the scrim (not the panel) receives the click.
  await page.getByRole('button', { name: 'Close', exact: true }).click({ position: { x: 10, y: 10 } });
  await expect(page.locator('.screen__body').getByText('Booked', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Directions', exact: true }).click();
  await page.getByRole('button', { name: 'Google Maps' }).click();
  await page.getByRole('button', { name: 'Add to calendar', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'See the details' }).click();
  await expect(details).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click({ position: { x: 10, y: 10 } });
  await page.getByRole('button', { name: 'See everyone', exact: true }).click();
  await expect(page.getByText('5 people, including you')).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click({ position: { x: 10, y: 10 } });
  await page.getByRole('button', { name: "Can't make it? Let Jordan know" }).click();
  await page.getByRole('button', { name: "I can't make it" }).click();
  await expect(page.getByText("You're out")).toBeVisible();
  await page.getByRole('button', { name: 'Changed your mind? Rejoin' }).click();
  await expect(page.getByText('Tavola Verde')).toBeVisible();
  await page.getByRole('link', { name: /morning after/ }).click();
  await expect(page.getByText('It was a blast!')).toBeVisible();
});
