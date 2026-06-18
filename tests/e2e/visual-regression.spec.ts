import { test, expect } from '@playwright/test';

const routes = [
  { path: '/', name: 'homepage', maxDiffPixelRatio: 0.05 },
  { path: '/pdf-tools', name: 'pdf-tools', maxDiffPixelRatio: 0.03 },
  { path: '/image-tools', name: 'image-tools', maxDiffPixelRatio: 0.03 },
  { path: '/tools', name: 'tools', maxDiffPixelRatio: 0.03 },
  { path: '/date-tools', name: 'date-tools', maxDiffPixelRatio: 0.03 },
  { path: '/text-tools', name: 'text-tools', maxDiffPixelRatio: 0.03 },
  { path: '/validation-tools', name: 'validation-tools', maxDiffPixelRatio: 0.03 },
  { path: '/subscription', name: 'subscription', maxDiffPixelRatio: 0.03 },
  { path: '/premium', name: 'premium', maxDiffPixelRatio: 0.03 },
];

test.describe('visual regression', () => {
  for (const route of routes) {
    test(`${route.name} page layout matches snapshot`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState('load');
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(`${route.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: route.maxDiffPixelRatio ?? 0.01,
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
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForLoadState('load');
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(`homepage-${vp.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });
  }
});
