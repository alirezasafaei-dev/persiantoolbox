import { test, expect } from '@playwright/test';

const indexableRoutes = ['/tools', '/loan', '/salary', '/pdf-tools'];

test.describe('seo crawl contracts', () => {
  for (const route of indexableRoutes) {
    test(`has canonical and json-ld on ${route}`, async ({ request }) => {
      const response = await request.get(route);
      expect(response.ok()).toBeTruthy();
      const html = await response.text();

      expect(html).toContain('rel="canonical"');
      expect(html).toContain('application/ld+json');
    });
  }

  test('sitemap excludes noindex routes and includes core indexable routes', async ({
    request,
  }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();
    const xml = await response.text();
    const sitemapPaths = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g))
      .map((match) => match[1])
      .filter((loc): loc is string => Boolean(loc))
      .map((loc) => new URL(loc).pathname);

    expect(sitemapPaths).toContain('/tools');
    expect(sitemapPaths).toContain('/loan');
    expect(sitemapPaths).not.toContain('/offline');
  });
});
