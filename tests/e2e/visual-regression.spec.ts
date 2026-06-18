import { test, expect } from '@playwright/test';

const isCI = !!process.env['CI'];

const routes = [
  { path: '/', name: 'homepage' },
  { path: '/pdf-tools', name: 'pdf-tools' },
  { path: '/image-tools', name: 'image-tools' },
  { path: '/tools', name: 'tools' },
  { path: '/date-tools', name: 'date-tools' },
  { path: '/text-tools', name: 'text-tools' },
  { path: '/validation-tools', name: 'validation-tools' },
  { path: '/subscription', name: 'subscription' },
  { path: '/premium', name: 'premium' },
];

test.describe('visual regression', () => {
  for (const route of routes) {
    test(`${route.name} page layout matches snapshot`, async ({ page }) => {
      test.skip(
        isCI,
        'visual regression skipped in CI due to dynamic content rendering differences',
      );
      await page.goto(route.path);
      await page.waitForLoadState('load');
      await page.waitForTimeout(2000);
      await expect(page).toHaveScreenshot(`${route.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });
  }
});

test.describe('responsive visual regression', () => {
  const viewports = [
    { name: 'mobile', width: 360, height: 800 },
    { name: 'tablet', width: 768, height: 1024 },
  ];

  for (const vp of viewports) {
    test(`homepage ${vp.name} layout matches snapshot`, async ({ page }) => {
      test.skip(
        isCI,
        'visual regression skipped in CI due to dynamic content rendering differences',
      );
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForLoadState('load');
      await page.waitForTimeout(2000);
      await expect(page).toHaveScreenshot(`homepage-${vp.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });
  }
});
