import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

test('keeps content visible during a slow route without a dedicated loading fallback', async ({
  page,
}) => {
  let release = () => {};
  let signalRequest = () => {};
  const requested = new Promise<void>((resolve) => {
    signalRequest = resolve;
  });
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/about*', async (route) => {
    signalRequest();
    await gate;
    await route.continue();
  });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('mobile-menu')).toHaveAttribute('aria-expanded', 'false');
    const previousHeading = await page.locator('main h1').textContent();
    await page.locator('footer a[href="/about"]').click({ noWaitAfter: true });
    await requested;
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('main h1')).toHaveText(previousHeading ?? '');
    release();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator('main h1')).toBeVisible();
  } finally {
    release();
  }
});

test('opens mobile navigation before scripts load and retains it through hydration', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && /hydrat|mismatch/i.test(message.text()))
      errors.push(message.text());
  });
  let release = () => {};
  const scripts = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/\/_next\/static\/.*\.js(?:\?.*)?$/, async (route) => {
    await scripts;
    await route.continue();
  });
  try {
    await page.goto('/', { waitUntil: 'commit' });
    await page.getByTestId('mobile-menu').click();
    const menu = page.getByRole('dialog', { name: 'منوی ناوبری', exact: true });
    await expect(menu).toBeVisible();
    await menu.getByRole('button', { name: 'ابزارهای رایگان', exact: true }).click();
    await expect(menu.locator('a[href="/pdf-tools"]')).toBeVisible();
    release();
    await page.waitForLoadState('networkidle');
    await expect(menu).toBeVisible();
    await expect(menu.locator('a[href="/pdf-tools"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    expect(errors).toEqual([]);
    await page.getByTestId('mobile-menu').click();
    await expect(menu).toBeVisible();
    await menu.locator('a[href="/search"]').click();
    await expect(page).toHaveURL(/\/search$/);
    await expect(menu).toBeHidden();
  } finally {
    release();
  }
});

test.describe('native mobile navigation', () => {
  test.use({ javaScriptEnabled: false });
  test('navigation and nested links work without JavaScript', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await test.step('open native disclosure', () => page.getByTestId('mobile-menu').click());
    const menu = page.getByRole('dialog', { name: 'منوی ناوبری', exact: true });
    await test.step('expose menu links', () => expect(menu).toBeVisible());
    await menu.getByRole('button', { name: 'ابزارهای رایگان', exact: true }).click();
    await expect(menu.locator('a[href="/pdf-tools"]')).toBeVisible();
    await menu.getByRole('button', { name: 'خروجی حرفه‌ای', exact: true }).click();
    await expect(menu.locator('a[href="/business-tools/document-studio"]')).toBeVisible();
    await menu.locator('a[href="/business-tools/document-studio"]').click();
    await expect(page).toHaveURL(/\/business-tools\/document-studio$/);
  });
});
