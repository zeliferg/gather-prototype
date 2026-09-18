import { test, expect } from '@playwright/test';

test('organizer spine: landing to the morning after', async ({ page }) => {
  await page.goto('/org');
  await page.getByRole('button', { name: 'Start a party' }).click();

  // ORG 1: fields start empty and Create party stays disabled until every one is filled.
  await expect(page.getByLabel('Your name')).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Create party' })).toBeDisabled();
  await page.getByLabel('Your name').fill('Jordan Reyes');
  await page.getByLabel('Party name').fill("Jordan's Dinner");
  await page.getByLabel('When').fill('2025-09-12T19:00'); // a Friday, matching the fixture copy
  await expect(page.getByLabel('When')).toHaveValue('2025-09-12T19:00');
  await page.getByLabel('Your phone').fill('(555) 019-2244');
  await expect(page.getByRole('button', { name: 'Create party' })).toBeDisabled(); // location still unset

  // ORG 1a: the permission dialog comes first, alone; the drawer only opens after Allow.
  await page.getByRole('button', { name: 'Your location' }).click();
  await expect(page.getByRole('alertdialog', { name: 'Location permission' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Your location' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Allow', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Your location' })).toBeVisible();
  await page.getByRole('button', { name: '5 mi' }).click();
  await page.getByRole('button', { name: 'Use this location' }).click();
  await expect(page.getByText('within 5 mi')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create party' })).toBeEnabled();

  // Create party goes straight to Verify (no SMS screen in between).
  await page.getByRole('button', { name: 'Create party' }).click();
  await expect(page.getByRole('heading', { name: "Verify it's you" })).toBeVisible();

  // ORG 3: boxes start empty and fill when the field is tapped; Continue shows progress then lands on the hub.
  await expect(page.getByLabel('6-digit code')).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();
  await page.getByLabel('6-digit code').click();
  await expect(page.getByLabel('6-digit code')).toHaveValue(/^\d{6}$/);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('button', { name: /Verifying|Verified/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: "Jordan's Dinner" })).toBeVisible({ timeout: 5000 });

  // The management-link text arrives as a banner on the hub.
  await expect(page.getByRole('status')).toContainText('is live');

  // ORG 4: Edit details opens prefilled with what the host entered.
  await page.getByRole('button', { name: 'Edit details' }).click();
  const editDialog = page.getByRole('dialog', { name: 'Edit details' });
  await expect(editDialog).toBeVisible();
  await expect(editDialog.getByLabel('Party name')).toHaveValue("Jordan's Dinner");
  await expect(editDialog.getByLabel('When')).toHaveValue('2025-09-12T19:00');
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  // ORG 4b: add a guest manually; Send invite waits for both fields, then confirms and the count grows.
  await page.getByRole('button', { name: 'Add a guest' }).click();
  await expect(page.getByRole('button', { name: 'Send invite' })).toBeDisabled();
  await page.getByLabel('Name', { exact: true }).fill('Lena Park');
  await page.getByLabel('Phone').fill('(555) 310-8842');
  await page.getByRole('button', { name: 'Send invite' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Invite sent' })).toContainText('Invite sent to Lena Park');
  await page.getByRole('button', { name: 'Dismiss notification' }).click();
  await expect(page.getByText('3 of 6 have responded')).toBeVisible();

  // ORG 4d: edit cover; a colour is staged and Save applies it.
  await page.getByRole('button', { name: 'Edit cover' }).click();
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled(); // nothing changed yet
  await page.getByRole('button', { name: 'Matcha' }).click();
  await expect(page.getByRole('dialog', { name: 'Edit cover' })).toBeVisible();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Edit cover' })).toHaveCount(0);

  await page.getByRole('button', { name: 'See everyone', exact: true }).click();
  await page.getByRole('button', { name: 'Remind', exact: true }).first().click();
  await expect(page.getByText('Reminder sent')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click({ position: { x: 10, y: 10 } }); // scrim centre is under the sheet panel
  await page.getByRole('button', { name: "Remind the 3 who haven't" }).click();
  await expect(page.getByRole('heading', { name: "Everyone's in" })).toBeVisible({ timeout: 5000 });

  // ORG 5 → X → hub with Browse places as the primary CTA.
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading', { name: "Jordan's Dinner" })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Share invite link' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Browse places' }).click();

  await page.getByRole('tab', { name: 'Map' }).click();
  await page.getByRole('button', { name: 'Corner Table' }).click();
  await expect(page.getByRole('dialog', { name: 'Corner Table' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click({ position: { x: 10, y: 10 } }); // scrim centre is under the sheet panel
  await page.getByRole('tab', { name: 'List' }).click();
  await page.getByRole('button', { name: 'Tavola Verde' }).click();
  await page.getByRole('button', { name: 'Book 7:00 PM with [Partner]' }).click();

  // ORG 8 confirms the time already chosen.
  await expect(page.getByRole('heading', { name: 'Confirm your booking' })).toBeVisible();
  await expect(page.getByRole('button', { name: '7:00 PM', pressed: true })).toBeVisible();
  await page.getByRole('button', { name: 'Book 7:00 PM', exact: true }).click();
  await expect(page.getByRole('heading', { name: "You're all set" })).toBeVisible();
  await page.getByRole('button', { name: 'Back to the party' }).click();

  // ORG 10 keeps the cover; ORG 11 changes the reservation and the party page reflects it.
  await expect(page.locator('.cover')).toBeVisible();
  await page.getByRole('button', { name: 'Change time or place' }).click();
  await expect(page.getByRole('heading', { name: 'Change the reservation' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save and notify everyone' })).toBeDisabled(); // nothing changed yet
  await page.getByRole('button', { name: '7:30 PM' }).click();
  await page.getByRole('button', { name: 'Increase party size' }).click();
  await page.getByRole('button', { name: 'Save and notify everyone' }).click();
  await expect(page.getByText('Friday, Sep 12 at 7:30 PM')).toBeVisible();
  await expect(page.getByText('Table for 6')).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Reservation changed');

  await page.getByRole('link', { name: /morning after/ }).click();
  await expect(page.getByText('Thanks for hosting')).toBeVisible();
});
