import { test, expect, type Page } from '@playwright/test';

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
  { path: '/date-tools/jalali-converter', name: 'date-converter' },
];

async function getVisibleHorizontalOverflow(page: Page) {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll('body *'))
      .map((el) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          text: (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          visible:
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            rect.width > 0 &&
            rect.height > 0,
        };
      })
      .filter((item) => item.visible && (item.left < -1 || item.right > window.innerWidth + 1));
  });
}

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

        await expect(page.locator('h1').first()).toBeVisible();

        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);

        if (route.path === '/') {
          const overflow = await getVisibleHorizontalOverflow(page);
          expect(overflow).toEqual([]);
        }

        const actionableTargets = page.locator(
          'button:visible, a[role="button"]:visible, input[type="button"]:visible, input[type="submit"]:visible',
        );
        const count = await actionableTargets.count();
        for (let i = 0; i < count; i++) {
          const box = await actionableTargets.nth(i).boundingBox();
          if (box) {
            expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(24);
          }
        }
      });
    }

    test('navigation menu works on mobile', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const menuButton = page.getByTestId('mobile-menu');
      await expect(menuButton).toBeVisible();
      await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      await menuButton.click();

      const menuPanel = page.locator('#mobile-menu-panel');
      await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
      await expect(menuPanel).toBeVisible();
      await expect(menuPanel.getByRole('link', { name: 'جستجوی ابزارهای رایگان' })).toBeVisible();

      await menuButton.click();
      await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });
  });
}
