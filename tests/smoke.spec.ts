import { test, expect } from '@playwright/test';
import { flow } from './flow';

test('root redirects to the organizer entry', async ({ page }) => {
  test.skip(flow === 'participant', 'org routes not built in this flow');
  await page.goto('/');
  await expect(page).toHaveURL(/\/org$/);
});

test('unknown routes show the not-found screen', async ({ page }) => {
  await page.goto('/nope');
  await expect(page.getByRole('heading', { name: 'Not part of this prototype' })).toBeVisible();
});

test('flows work with reduced motion', async ({ browser }) => {
  test.skip(flow === 'participant', 'org routes not built in this flow');
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

// Chrome on iOS sizes `dvh` to the large viewport while its toolbars still take room, so a
// 100dvh shell overflowed the document by the toolbar height: the inner scroller chained into
// a document scroll, the top of the screen went off-screen and pull-to-refresh swallowed the
// way back. The shell must never be able to scroll the document, however tall it renders.
test('the document never scrolls, even when the shell outgrows the viewport', async ({ page }) => {
  await page.goto('/org/create');
  await page.addStyleTag({ content: '.phone { height: 120vh !important; }' });
  await page.evaluate(() => window.scrollTo(0, 400));
  const [scrollY, scrollable] = await page.evaluate(() => {
    const d = document.scrollingElement!;
    return [window.scrollY, d.scrollHeight - d.clientHeight];
  });
  expect(scrollY).toBe(0);
  expect(scrollable).toBe(0);
});

// Form validation (6 Oct 2026): the button stays disabled, a caption above it names the first thing
// missing, and a field flags itself only after the tester leaves it unfinished, clearing as soon as it's met.
test('Create party explains its disabled button and flags a field left unfinished', async ({ page }) => {
  test.skip(flow === 'participant', 'org routes not built in this flow');
  await page.goto('/org/create');
  const button = page.getByRole('button', { name: 'Create party' });
  await expect(button).toBeDisabled();
  await expect(page.getByText('Add your name to continue')).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);

  const phone = page.getByLabel('Your phone');
  await phone.fill('303555');
  await phone.blur();
  await expect(page.getByRole('alert')).toHaveText('Enter all 10 digits');
  await expect(page.getByText('to continue')).toHaveCount(0);
  await phone.fill('3035550142');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByText('Add your name to continue')).toBeVisible();

  await page.getByLabel('Your name').fill('Jordan');
  await expect(page.getByText('Give the party a name to continue')).toBeVisible();
  await page.getByLabel('Party name').fill('Taco Tuesday');
  await expect(page.getByText('Pick a date and time to continue')).toBeVisible();
  await expect(button).toBeDisabled();
});
