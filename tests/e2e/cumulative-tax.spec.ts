import { test, expect } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`cumulative A/B/D official calculation, recovery and relief guard at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto('/tools/tax-calculator');
    const consent = page.getByRole('dialog', { name: 'cookie consent' });
    await expect(consent).toBeVisible();
    await consent.getByRole('button', { name: 'رد همه کوکی‌ها', exact: true }).click();
    await expect(consent).toBeHidden();
    const card = page.getByTestId('cumulative-tax-balance');
    const result = card.getByRole('region', { name: 'نتیجهٔ مالیات تجمعی' });
    await expect(result).toContainText('جمع مالیات تا این فهرست: ۰ تومان');
    await card.locator('#cumulative-tax-special').fill('100000000');
    await expect(result).toContainText('جمع مالیات تا این فهرست: ۶٬۰۰۰٬۰۰۰ تومان');
    await card.locator('#cumulative-tax-special').fill('0');
    await card.locator('#cumulative-tax-research').fill('100000000');
    await expect(result).toContainText('جمع مالیات تا این فهرست: ۵٬۰۰۰٬۰۰۰ تومان');
    await card.locator('#cumulative-tax-ordinary').fill('۱۰۰۰۰۰۰۰۰');
    await card.locator('#cumulative-tax-special').fill('١٠٠٠٠٠٠٠٠');
    await card.locator('#cumulative-tax-research').fill('200000000');
    await card.locator('#cumulative-tax-previous').fill('5000000');
    await expect(result).toContainText('جمع مالیات تا این فهرست: ۲۹٬۰۰۰٬۰۰۰ تومان');
    await expect(result).toContainText('مبلغ مثبت قابل کسر این فهرست: ۲۴٬۰۰۰٬۰۰۰ تومان');
    await card.locator('#cumulative-tax-month').selectOption('2');
    await expect(result).toContainText('جمع مالیات تا این فهرست: ۲۲٬۰۰۰٬۰۰۰ تومان');
    await card.locator('#cumulative-tax-previous').fill('25000000');
    await expect(result).toContainText(
      'اختلاف منفی برای بررسی اصلاح یا بستانکاری: ۳٬۰۰۰٬۰۰۰ تومان',
    );
    await card.locator('#cumulative-tax-relief').check();
    await expect(result).toBeHidden();
    await expect(card.getByRole('alert')).toContainText('برای این معافیت‌ها نتیجه صادر نمی‌شود');
    await card.locator('#cumulative-tax-relief').uncheck();
    await expect(result).toBeVisible();
    await card.locator('#cumulative-tax-special').fill('-1');
    await expect(result).toBeHidden();
    await expect(card.getByRole('alert')).toBeVisible();
    await card.locator('#cumulative-tax-special').fill('');
    await expect(result).toBeHidden();
    await card.locator('#cumulative-tax-special').fill('100000000');
    await expect(result).toBeVisible();
    await card.locator('#cumulative-tax-ordinary').fill('9'.repeat(40));
    await expect(result).toBeHidden();
    await expect(card.getByRole('alert')).toBeVisible();
    await card.locator('#cumulative-tax-ordinary').fill('100000000');
    await expect(result).toBeVisible();
    await expect(
      card.getByRole('link', { name: 'راهنمای رسمی محاسبات تجمعی ۱۴۰۵ سازمان امور مالیاتی' }),
    ).toHaveAttribute('href', 'https://www.tax.gov.ir/action/do/download/227');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(pageErrors).toEqual([]);
  });
}
