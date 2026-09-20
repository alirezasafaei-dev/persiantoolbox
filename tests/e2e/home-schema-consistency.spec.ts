import { expect, test } from '@playwright/test';

type JsonLdNode = Record<string, unknown>;

function flattenJsonLd(value: unknown): JsonLdNode[] {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd);

  const node = value as JsonLdNode;
  const graph = node['@graph'];
  return [node, ...(Array.isArray(graph) ? graph.flatMap(flattenJsonLd) : [])];
}

test.describe('homepage schema identity and privacy copy', () => {
  test('uses one referenced Organization and WebSite identity', async ({ page }) => {
    await page.goto('/');

    await expect
      .poll(() => page.locator('script[type="application/ld+json"]').count())
      .toBeGreaterThan(1);

    const roots = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((elements) =>
        elements.map((element) => JSON.parse(element.textContent ?? '{}') as unknown),
      );
    const nodes = roots.flatMap(flattenJsonLd);
    const typedOrganizations = nodes.filter((node) => node['@type'] === 'Organization');
    const typedWebsites = nodes.filter((node) => node['@type'] === 'WebSite');
    expect(typedOrganizations).toHaveLength(1);
    expect(typedWebsites).toHaveLength(1);
    expect(typedOrganizations[0]?.['@id']).toMatch(/\/#organization$/);
    expect(typedWebsites[0]?.['@id']).toMatch(/\/#website$/);
    expect(typedOrganizations[0]?.['sameAs']).toContain(
      'https://github.com/alirezasafaeigfx/persiantoolbox',
    );
    expect(JSON.stringify(roots)).not.toContain('github.com/parsairaniiidev/persiantoolbox');

    const collection = nodes.find((node) => node['@type'] === 'CollectionPage');
    expect(collection?.['isPartOf']).toEqual({ '@id': typedWebsites[0]?.['@id'] });
  });

  test('keeps visible and schema privacy answers scoped', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('dialog', { name: 'cookie consent' })).toContainText(
      'بسیاری از ابزارها در مرورگر شما اجرا می‌شوند',
    );
    await page.getByRole('button', { name: 'رد همه کوکی‌ها' }).click();

    const question = page.getByText('آیا داده‌ها به سرور ارسال می‌شوند؟', { exact: true });
    await question.scrollIntoViewIfNeeded();
    await question.click();
    await expect(page.getByText(/بسیاری از ابزارها در مرورگر شما اجرا می‌شوند/)).toBeVisible();

    const schemaText = await page.locator('#home-json-ld').textContent();
    expect(schemaText).toContain('بسیاری از ابزارها در مرورگر شما اجرا می‌شوند');
    expect(schemaText).not.toContain('خیر. محاسبات، ویرایش فایل و تولید سند');
  });
});
