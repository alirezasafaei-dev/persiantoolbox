import { expect, test } from '@playwright/test';

const typographyCases = [
  { width: 390, titleSize: '24px', titleLine: '32px', outputSize: '20px', outputLine: '28px' },
  { width: 768, titleSize: '30px', titleLine: '36px', outputSize: '24px', outputLine: '32px' },
  { width: 1440, titleSize: '36px', titleLine: '40px', outputSize: '30px', outputLine: '36px' },
];

for (const typography of typographyCases) {
  test(`Base64 serves one primary heading with preserved typography at ${typography.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: typography.width, height: 1000 });
    const response = await page.request.get('/tools/base64-tool');
    expect(response.ok()).toBe(true);
    expect((await response.text()).match(/<h1\b/g) ?? []).toHaveLength(1);
    await page.goto('/tools/base64-tool');
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toHaveCount(1);
    await expect(heading).toHaveText('رمزگذاری Base64');
    await expect(heading).toHaveCSS('font-size', typography.titleSize);
    await expect(heading).toHaveCSS('line-height', typography.titleLine);
  });
}

test('Base64 emits one registry-aligned text-tools breadcrumb', async ({ page }) => {
  await page.goto('/tools/base64-tool');
  const breadcrumbs = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) => {
      const roots = scripts.flatMap((script) => {
        const schema = JSON.parse(script.textContent ?? '{}');
        return Array.isArray(schema) ? schema : [schema];
      });
      return roots
        .flatMap((schema) => [schema, ...(schema['@graph'] ?? [])])
        .filter((schema) => schema['@type'] === 'BreadcrumbList');
    });
  expect(breadcrumbs).toHaveLength(1);
  expect(breadcrumbs[0].itemListElement[1]).toMatchObject({
    name: 'ابزارهای متنی',
    item: 'https://persiantoolbox.ir/text-tools',
  });
});

for (const typography of typographyCases) {
  test(`Base64 Unicode round-trip and output typography at ${typography.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: typography.width, height: 1000 });
    await page.goto('/tools/base64-tool', { waitUntil: 'load' });
    const input = 'سلام React 19';
    const encoded = Buffer.from(input, 'utf8').toString('base64');
    await page.getByLabel('متن مورد نظر برای رمزگذاری', { exact: true }).fill(input);
    await page.getByRole('button', { name: 'رمزگذاری', exact: true }).last().click();
    await expect(page.locator('pre')).toHaveText(encoded);
    await expect(page.getByRole('heading', { name: 'خروجی', level: 2, exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'خروجی', level: 2, exact: true })).toHaveCSS(
      'font-size',
      typography.outputSize,
    );
    await expect(page.getByRole('heading', { name: 'خروجی', level: 2, exact: true })).toHaveCSS(
      'line-height',
      typography.outputLine,
    );

    await page.getByRole('button', { name: 'جابجایی', exact: true }).click();
    await expect(page.getByLabel('Base64 ورودی برای رمزگشایی', { exact: true })).toHaveValue(
      encoded,
    );
    await page.getByRole('button', { name: 'رمزگشایی', exact: true }).last().click();
    await expect(page.locator('pre')).toHaveText(input);
  });
}
