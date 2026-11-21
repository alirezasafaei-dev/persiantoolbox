import { expect, test } from '@playwright/test';

test('accepts localized decimal quantities in initial and added invoice rows', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tools/invoice-generator');
  const quantities = page.getByLabel('تعداد', { exact: true });
  const prices = page.getByLabel('قیمت واحد', { exact: true });

  await page.getByRole('button', { name: /افزودن ردیف/ }).click();
  await expect(quantities).toHaveCount(2);
  await quantities.first().fill('۱٫۵');
  await expect(quantities.first()).toHaveValue('۱٫۵');
  await prices.first().fill('۱۰۰٬۰۰۰');

  await quantities.nth(1).fill('٠٫٥');
  await expect(quantities.nth(1)).toHaveValue('٠٫٥');
  await prices.nth(1).fill('۱۰۰٬۰۰۰');

  await expect(page.getByText('۲۰۰٬۰۰۰ تومان', { exact: true }).first()).toBeVisible();
});
