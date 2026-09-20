import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'pt-consent',
        JSON.stringify({
          ad_storage: false,
          ad_user_data: false,
          ad_personalization: false,
          analytics_storage: false,
          version: 'v2',
        }),
      );
    });
  });

  test('should load and display hero section', async ({ page }) => {
    await page.goto('/');

    const hero = page.locator('h1');
    await expect(hero).toContainText('ابزارهای فارسی');

    await expect(page.getByText('مسیر پیشنهادی برای هر نوع کاربر')).toBeVisible();
    await expect(page.getByText('جستجوهای پرکاربرد ابزار رایگان')).toBeVisible();

    const popularTools = page.locator('section[aria-labelledby="popular-tools-heading"]');
    await expect(popularTools).toBeVisible();
  });

  test('should navigate to PDF tools', async ({ page }) => {
    await page.goto('/');

    const cta = page.locator('a[href="/pdf-tools"]').first();
    await cta.click();
    await expect(page).toHaveURL(/\/pdf-tools\/?$/);
    await expect(page.locator('h1')).toContainText('ابزارهای PDF');
  });

  test('searches for a Persian tool and opens the result', async ({ page }) => {
    await page.goto('/');

    const search = page.getByRole('combobox', { name: 'جستجوی ابزار' });
    await expect(search).toBeVisible();
    await search.fill('محاسبه وام');

    const loanResult = page.locator('#tool-search-listbox a[href="/loan"]');
    await expect(loanResult).toBeVisible();
    await loanResult.click();

    await expect(page).toHaveURL(/\/loan\/?$/);
    await expect(page.locator('h1')).toContainText('وام');
  });

  test('primary CTA and popular-tools anchor navigate without fallback', async ({ page }) => {
    await page.goto('/');

    await page.locator('a[href="/search"]').first().click();
    await expect(page).toHaveURL(/\/search\/?$/);
    await expect(page.locator('h1')).toHaveCount(1);

    await page.goto('/');
    await page.locator('a[href="#popular-tools-heading"]').click();
    await expect(page).toHaveURL(/\/#popular-tools-heading$/);
    await expect(page.locator('#popular-tools-heading')).toBeInViewport();
  });

  test('has no horizontal overflow at narrow approved widths', async ({ page }) => {
    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
    }
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu).toBeVisible();
  });

  test('should have proper accessibility', async ({ page }) => {
    await page.goto('/');

    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);

    const images = page.locator('img');
    const imageCount = await images.count();
    for (let i = 0; i < imageCount; i++) {
      const altText = await images.nth(i).getAttribute('alt');
      expect(altText).toBeTruthy();
    }
  });
});
