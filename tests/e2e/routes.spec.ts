import { test, expect } from '@playwright/test';

const routes = [
  { path: '/', heading: 'ابزارهای فارسی که' },
  { path: '/loan', heading: 'محاسبه' },
  { path: '/salary', heading: 'حقوق' },
  { path: '/image-tools', heading: 'ابزارهای تصویر' },
  { path: '/pdf-tools', heading: 'ابزارهای PDF' },
  { path: '/date-tools', heading: 'ابزارهای تاریخ' },
  { path: '/text-tools', heading: 'ابزارهای متنی' },
  { path: '/validation-tools', heading: 'اعتبارسنجی' },
  { path: '/tools', heading: 'همه ابزارها' },
  { path: '/developers', heading: 'توسعه‌دهندگان' },
];

test.describe('main routes', () => {
  for (const route of routes) {
    test(`renders ${route.path}`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(route.heading);
    });
  }
});
