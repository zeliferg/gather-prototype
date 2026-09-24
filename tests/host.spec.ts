import { test, expect } from '@playwright/test';

test('organizer spine: landing to the morning after', async ({ page }) => {
  test.setTimeout(60_000); // ~25s locally; CI's two-worker runner sat right on the 30s default (run #75, 23 Sep 2026)
  await page.goto('/org');
  await page.getByRole('button', { name: 'Start a party' }).click();

  // ORG 1: fields start empty and Create party stays disabled until every one is filled.
  await expect(page.getByLabel('Your name')).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Create party' })).toBeDisabled();
  await page.getByLabel('Your name').fill('Jordan Reyes');
  await page.getByLabel('Party name').fill("Jordan's Dinner");
  // When is a calendar sheet: pick Friday 12 Sep 2025 (the fixture date), then the minute wheel.
  await page.getByRole('button', { name: 'When, Tap to set' }).click();
  const whenDialog = page.getByRole('dialog', { name: 'When', exact: true });
  await expect(whenDialog).toBeVisible();
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); // the picker opens on tomorrow at 7:00 PM
  for (let i = (tomorrow.getFullYear() - 2025) * 12 + tomorrow.getMonth() - 8; i > 0; i--) await whenDialog.getByRole('button', { name: 'Previous month' }).click();
  await expect(whenDialog.getByRole('grid', { name: 'September 2025' })).toBeVisible();
  await whenDialog.getByRole('button', { name: 'Friday, September 12' }).click();
  await expect(whenDialog.getByRole('option', { name: '7', exact: true })).toHaveAttribute('aria-selected', 'true');
  await whenDialog.getByRole('option', { name: '05', exact: true }).click();
  await whenDialog.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByRole('button', { name: 'When, Fri, Sep 12 · 7:05 PM' })).toBeVisible();
  await page.getByRole('button', { name: 'When, Fri, Sep 12 · 7:05 PM' }).click();
  await whenDialog.getByRole('option', { name: '00', exact: true }).click();
  await whenDialog.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByRole('button', { name: 'When, Fri, Sep 12 · 7:00 PM' })).toBeVisible();
  await page.getByLabel('Your phone').fill('5550192244');
  await expect(page.getByLabel('Your phone')).toHaveValue('(555) 019-2244'); // formatted as typed
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
  await expect(page.getByText('We texted a 6-digit code to (555) 019-2244.')).toBeVisible(); // the number from ORG 1

  // ORG 3: boxes start empty and fill when the field is tapped; Continue shows progress then lands on the hub.
  await expect(page.getByLabel('6-digit code')).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();
  await page.getByLabel('6-digit code').click();
  await expect(page.getByLabel('6-digit code')).toHaveValue('428913');
  // Resend: the link reports progress, a Messages banner brings a new code, and the boxes refill with it.
  await page.getByRole('button', { name: "Didn't get it? Resend code" }).click();
  await expect(page.getByRole('button', { name: /Sending a new code|New code sent/ })).toBeDisabled();
  await expect(page.getByRole('status')).toContainText('Your Gather code is 917204', { timeout: 5000 });
  await expect(page.getByLabel('6-digit code')).toHaveValue('917204');
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
  await expect(editDialog.getByRole('button', { name: 'When, Fri, Sep 12 · 7:00 PM' })).toBeVisible();
  await expect(editDialog.getByRole('button', { name: 'Save', exact: true })).toBeDisabled(); // nothing changed yet
  // Tapping When swaps the drawer for the calendar and comes back.
  await editDialog.getByRole('button', { name: 'When, Fri, Sep 12 · 7:00 PM' }).click();
  await expect(page.getByRole('dialog', { name: 'When', exact: true })).toBeVisible();
  await page.getByRole('dialog', { name: 'When', exact: true }).getByRole('button', { name: 'Done' }).click();
  await expect(editDialog).toBeVisible();
  await editDialog.getByLabel('Party name').fill("Jordan's Dinner!");
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('heading', { name: "Jordan's Dinner!" })).toBeVisible();
  await page.getByRole('button', { name: 'Edit details' }).click();
  await editDialog.getByLabel('Party name').fill("Jordan's Dinner");
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('heading', { name: "Jordan's Dinner" })).toBeVisible();

  // ORG 4b: add a guest manually; Send invite waits for both fields, then confirms and the count grows.
  await page.getByRole('button', { name: 'Add a guest' }).click();
  await expect(page.getByRole('button', { name: 'Send invite' })).toBeDisabled();
  await page.getByLabel('Name', { exact: true }).fill('Lena Park');
  await page.getByLabel('Phone').fill('5553108842');
  await expect(page.getByLabel('Phone')).toHaveValue('(555) 310-8842');
  await page.getByRole('button', { name: 'Send invite' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Invite sent' })).toContainText('Invite sent to Lena Park');
  await page.getByRole('button', { name: 'Dismiss notification' }).click();
  await expect(page.getByText('3 of 6 responded')).toBeVisible(); // Leo, who replied he's out, only shows in the sheet

  // ORG 4h: a beat after the Messages banner has gone, Gather nudges the host about who's missing; tapping it opens Guests.
  const nudge = page.getByRole('status').filter({ hasText: 'Waiting on 3 people' });
  await expect(nudge).toBeVisible({ timeout: 15_000 });
  await nudge.click();
  await expect(page.getByRole('dialog', { name: 'Guests' })).toBeVisible();
  await expect(nudge).toHaveCount(0);
  await page.getByRole('button', { name: 'Close' }).click({ position: { x: 10, y: 10 } });

  // The host's own preferences are always a row under Guests, empty or not, and open the sheet to change.
  await expect(page.getByRole('button', { name: 'Your preferences' })).toContainText('Tap to add');
  await page.getByRole('button', { name: 'Your preferences' }).click();
  await page.getByRole('dialog', { name: 'Your preferences' }).getByRole('button', { name: 'Vegetarian' }).click();
  await page.getByRole('button', { name: 'Save preferences' }).click();
  await expect(page.getByRole('button', { name: 'Your preferences' })).toContainText('Vegetarian');

  // Share invite: the link card opens one drawer with Copy and quick ways to send; Remind is the page's only CTA.
  await page.getByRole('button', { name: 'Share invite link' }).click();
  const share = page.getByRole('dialog', { name: 'Invite people' });
  await expect(share.getByRole('link', { name: 'Messages' })).toBeVisible();
  await share.getByRole('button', { name: 'Copy' }).click();
  await expect(share.getByRole('button', { name: 'Copied' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click({ position: { x: 10, y: 10 } });
  await expect(share).toHaveCount(0);

  // ORG 4d: edit cover; a colour is staged and Save applies it.
  await page.getByRole('button', { name: 'Edit cover' }).click();
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled(); // nothing changed yet
  await page.getByRole('button', { name: 'Matcha' }).click();
  await expect(page.getByRole('dialog', { name: 'Edit cover' })).toBeVisible();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Edit cover' })).toHaveCount(0);

  // ORG 4c: a guest row opens their actions; Leo, who can't make it, sits in his own group and can be removed.
  await page.getByRole('button', { name: 'See everyone', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Guests' })).toContainText("1 can't make it");
  await expect(page.getByRole('dialog', { name: 'Guests' })).toContainText('Jordan Reyes'); // the host row carries the typed name
  await page.getByRole('button', { name: 'Alex Chen' }).click();
  await page.getByRole('button', { name: 'Send a reminder' }).click();
  await expect(page.getByText('Reminder sent')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Leo Martins' })).toBeVisible();
  await page.getByRole('button', { name: 'Leo Martins' }).click();
  await page.getByRole('button', { name: 'Remove from the party' }).click();
  await expect(page.getByRole('button', { name: 'Leo Martins' })).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: 'Guests' })).toContainText('3 of 6 responded');
  await page.getByRole('button', { name: 'Close' }).click({ position: { x: 10, y: 10 } }); // scrim centre is under the sheet panel
  await page.getByRole('button', { name: "Remind the 3 who haven't" }).click();
  await expect(page.getByRole('heading', { name: "Everyone's in" })).toBeVisible({ timeout: 5000 });

  // ORG 5 → X → hub: the stepper is gone, the places are listed on the page, Browse places is the primary CTA.
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading', { name: "Jordan's Dinner" })).toBeVisible();
  await expect(page.getByText("Everyone's in")).toBeVisible();
  await expect(page.getByRole('button', { name: 'Share invite link' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /3 places that work/ })).toBeVisible(); // the places card leads, as one tap
  await expect(page.getByText('Noodle Bar Riverside')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add a guest' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Browse places' }).click();

  // ORG 6c from a pin, with no slot tapped first: nothing is selected and the CTA waits for a time.
  await page.getByRole('tab', { name: 'Map' }).click();
  await page.getByRole('button', { name: 'Corner Table' }).click();
  const corner = page.getByRole('dialog', { name: 'Corner Table' });
  await expect(corner).toBeVisible();
  await expect(corner.getByRole('button', { pressed: true })).toHaveCount(0);
  await expect(corner.getByRole('button', { name: 'Book with OpenTable' })).toBeDisabled();
  await page.getByRole('button', { name: 'Close' }).click({ position: { x: 10, y: 10 } }); // scrim centre is under the sheet panel
  // ORG 6: tapping a slot on the card opens the sheet with it selected.
  await page.getByRole('tab', { name: 'List' }).click();
  await page.getByRole('group', { name: 'Tavola Verde times' }).getByRole('button', { name: '7:00 PM', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Tavola Verde' }).getByRole('button', { name: '7:00 PM', pressed: true })).toBeVisible();
  await page.getByRole('button', { name: 'Book 7:00 PM with OpenTable' }).click();

  // ORG 8 is the same sheet's confirm step: photo, date and time, table and address, one Confirm; "Pick another time" goes back to the slots.
  const confirm = page.getByRole('dialog', { name: 'Confirm your booking' });
  await expect(confirm).toContainText('Tavola Verde');
  await expect(confirm).toContainText('Friday, Sep 12 at 7:00 PM');
  await expect(confirm).toContainText('Table for 5');
  await expect(confirm.getByRole('button', { pressed: true })).toHaveCount(0); // no slot row here any more
  await expect(confirm.locator('.rcard__photo img')).toBeVisible();
  await confirm.getByRole('button', { name: 'Pick another time' }).click();
  await expect(page.getByRole('dialog', { name: 'Tavola Verde' }).getByRole('button', { name: '7:00 PM', pressed: true })).toBeVisible();
  await page.getByRole('button', { name: 'Book 7:00 PM with OpenTable' }).click();
  await confirm.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(confirm.getByRole('button', { name: /Booking your table|Booked/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: "You're all set" })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Back to the party' }).click();

  // ORG 10 keeps the cover and can still edit it: choices preview at once, Cancel puts the old one back.
  await expect(page.locator('.cover')).toBeVisible();
  await page.getByRole('button', { name: 'Edit cover' }).click();
  await page.getByRole('button', { name: 'Blue' }).click();
  await expect(page.getByRole('button', { name: 'Blue', pressed: true })).toBeVisible();
  await page.getByRole('dialog', { name: 'Edit cover' }).getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Edit cover' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Edit cover' })).toBeVisible();
  // ORG 10: Edit details is back; Your location swaps the drawer for the location sheet and returns.
  await page.getByRole('button', { name: 'Edit details' }).click();
  await page.getByRole('dialog', { name: 'Edit details' }).getByRole('button', { name: /^Your location, / }).click();
  await expect(page.getByRole('dialog', { name: 'Your location' })).toBeVisible();
  await page.getByRole('button', { name: 'Use this location' }).click();
  await expect(page.getByRole('dialog', { name: 'Edit details' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Close' }).click({ position: { x: 10, y: 10 } });
  // ORG 11 changes the reservation and the party page reflects it.
  await page.getByRole('button', { name: 'Change time or place' }).click();
  await expect(page.getByRole('heading', { name: 'Change the reservation' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save and notify everyone' })).toBeDisabled(); // nothing changed yet
  await page.getByRole('button', { name: '7:30 PM' }).click();
  // A table for 7 can't have 7:30 at Tavola Verde: the slots change and Save waits for a new pick.
  await page.getByRole('button', { name: 'Increase party size' }).click();
  await page.getByRole('button', { name: 'Increase party size' }).click();
  await expect(page.getByText("7:30 PM isn't available for 7")).toBeVisible();
  await expect(page.getByRole('button', { name: '7:30 PM' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Save and notify everyone' })).toBeDisabled();
  await page.getByRole('button', { name: 'Decrease party size' }).click();
  await expect(page.getByRole('button', { name: '7:30 PM', pressed: true })).toBeVisible(); // back to 6, the pick returns
  await page.getByRole('button', { name: 'Save and notify everyone' }).click();
  await expect(page.getByText('Friday, Sep 12 at 7:30 PM')).toBeVisible();
  await expect(page.getByText('Table for 6')).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Reservation changed');

  // ORG 10: Start over clears the tab and returns to the landing.
  await page.getByRole('button', { name: 'Start over' }).click();
  await expect(page.getByRole('heading', { name: 'Bring everyone together' })).toBeVisible();
  await page.getByRole('button', { name: 'Start a party' }).click();
  await expect(page.getByLabel('Your name')).toHaveValue('');

  // ORG 12 has no in-app link any more; it is reached by its route.
  await page.goto('/org/sms-after');
  await expect(page.getByText('Thanks for hosting')).toBeVisible();
});

test('a banner swipes up to dismiss', async ({ page }) => {
  await page.goto('/org/hub');
  await page.getByRole('button', { name: 'Add a guest' }).click();
  const add = page.getByRole('dialog', { name: 'Add a guest' });
  await expect(add).toBeVisible();
  await add.getByLabel('Name', { exact: true }).fill('Lena Park');
  await add.getByLabel('Phone').fill('5553108842');
  await expect(add.getByLabel('Phone')).toHaveValue('(555) 310-8842');
  await expect(add.getByLabel('Name', { exact: true })).toHaveValue('Lena Park');
  await add.getByRole('button', { name: 'Send invite' }).click();
  const banner = page.getByRole('status').filter({ hasText: 'Invite sent' });
  await expect(banner).toBeVisible();
  await page.waitForTimeout(700); // let it finish sliding in
  await page.evaluate(async () => {
    const el = document.querySelector('.banner-wrap--in .notif') as HTMLElement;
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2, y0 = r.top + r.height / 2;
    const doc = document as Document & { createTouch: (w: Window, t: EventTarget, id: number, px: number, py: number, sx: number, sy: number) => Touch; createTouchList: (...t: Touch[]) => TouchList };
    const fire = (type: string, y: number) => {
      const t = doc.createTouch(window, el, 1, x, y, x, y);
      const list = type === 'touchend' ? doc.createTouchList() : doc.createTouchList(t);
      el.dispatchEvent(new TouchEvent(type, { touches: list, targetTouches: list, changedTouches: doc.createTouchList(t), bubbles: true, cancelable: true }));
    };
    fire('touchstart', y0);
    for (let i = 1; i <= 6; i++) { fire('touchmove', y0 - (80 * i) / 6); await new Promise((res) => setTimeout(res, 16)); }
    fire('touchend', y0 - 80);
  });
  await expect(banner).toHaveCount(0);
});
