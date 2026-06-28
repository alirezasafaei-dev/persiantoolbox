import { test, expect } from '@playwright/test';

const mobileViewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'Samsung Galaxy S21', width: 360, height: 800 },
];

const routes = [
  { path: '/', name: 'homepage' },
  { path: '/tools', name: 'tools-hub' },
  { path: '/salary', name: 'salary-calculator' },
  { path: '/loan', name: 'loan-calculator' },
  { path: '/pdf-tools', name: 'pdf-tools' },
  { path: '/date-tools/shamsi-gregorian', name: 'date-converter' },
];

for (const viewport of mobileViewports) {
  test.describe(`Mobile UX - ${viewport.name}`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    });

    for (const route of routes) {
      test(`${route.name} renders correctly on mobile`, async ({ page }) => {
        await page.goto(route.path, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');

        // Check H1 exists
        const h1 = page.locator('h1').first();
        await expect(h1).toBeVisible();

        // Check no horizontal overflow
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);

        // Check touch targets are at least 44px
        const buttons = page.locator('button, a[href]');
        const count = await buttons.count();
        for (let i = 0; i < Math.min(count, 5); i++) {
          const box = await buttons.nth(i).boundingBox();
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
      });
    }

    test('navigation menu works on mobile', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');

      // Open mobile menu
      const menuButton = page.getByLabel('باز کردن منوی ناوبری');
      await expect(menuButton).toBeVisible();
      await menuButton.click();

      // Check menu is open
      const menuPanel = page.locator('#mobile-menu-panel');
      await expect(menuPanel).toBeVisible();

      // Check search link exists
      const searchLink = page.getByText('جستجوی ابزارها');
      await expect(searchLink).toBeVisible();

      // Close menu
      await menuButton.click();
    });
  });
}
