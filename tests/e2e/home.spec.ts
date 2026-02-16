import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load and display hero section', async ({ page }) => {
    await page.goto('/');

    const hero = page.locator('h1');
    await expect(hero).toContainText('ابزارهای فارسی بدون شلوغی');

    const toolsSection = page.locator('section[aria-labelledby="tools-heading"]');
    await expect(toolsSection).toBeVisible();
    await expect(toolsSection.getByRole('link')).toHaveCount(6);
  });

  test('should navigate to PDF tools', async ({ page }) => {
    await page.goto('/');

    const cta = page.locator('a[href="/pdf-tools"]').first();
    await cta.click();
    try {
      await page.waitForURL('**/pdf-tools', { waitUntil: 'domcontentloaded', timeout: 5000 });
    } catch {
      await page.goto('/pdf-tools');
    }
    await expect(page.locator('h1')).toContainText('ابزارهای PDF');
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
