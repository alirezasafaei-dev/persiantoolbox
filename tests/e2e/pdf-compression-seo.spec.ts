import { expect, test } from '@playwright/test';
import { getToolsByCategory } from '../../lib/tools-registry';

test('compression search metadata and visible guidance describe the available operation', async ({
  request,
  page,
}) => {
  const route = '/pdf-tools/compress/compress-pdf';
  const response = await request.get(route);
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('میزان کاهش حجم به ساختار PDF بستگی دارد');
  expect(html).not.toMatch(/تا ۹۰٪|سه سطح کیفیت|سطح فشرده‌سازی را انتخاب کنید/);

  await page.goto(route);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('PDF');
  await expect(
    page
      .getByRole('main')
      .getByText(/۵۰ مگابایت/)
      .first(),
  ).toBeVisible();
  await expect(
    page
      .getByRole('main')
      .getByText(/برای فایل امضاشده/)
      .first(),
  ).toBeVisible();
});

test('the PDF hub and all 17 tools expose indexable HTML and valid structured data', async ({
  request,
}) => {
  const tools = getToolsByCategory('pdf-tools').filter(
    (tool) => tool.kind === 'tool' && tool.indexable,
  );
  expect(tools).toHaveLength(17);

  const sitemapResponse = await request.get('/sitemap.xml');
  expect(sitemapResponse.status()).toBe(200);
  const sitemap = await sitemapResponse.text();
  const robotsResponse = await request.get('/robots.txt');
  expect(robotsResponse.status()).toBe(200);
  const robots = await robotsResponse.text();
  expect(robots).not.toMatch(/^Disallow:\s*\/pdf-tools(?:\/|\s|$)/m);

  const paths = ['/pdf-tools', ...tools.map((tool) => tool.path)];
  const titles = new Set();
  const descriptions = new Set();
  for (const path of paths) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(200);
    const html = await response.text();
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    expect(canonical, path).toBe(`https://persiantoolbox.ir${path}`);
    expect(sitemap.includes(`<loc>${canonical}</loc>`), path).toBe(true);
    expect(response.headers()['x-robots-tag'] ?? '', path).not.toMatch(/noindex/i);
    expect(html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? '', path).not.toMatch(
      /noindex/i,
    );
    expect(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1], path).toBeTruthy();
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
    expect(title, path).toBeTruthy();
    expect(description, path).toBeTruthy();
    titles.add(title);
    descriptions.add(description);
    expect(html.match(/<meta property="og:image" content="([^"]+)"/)?.[1], path).toBeTruthy();
    const schema = [
      ...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
    ];
    expect(schema.length, path).toBeGreaterThan(0);
    schema.forEach((item) => {
      const node = JSON.parse(item[1] ?? '');
      expect(node['@context'], path).toBeTruthy();
    });
    if (path === '/pdf-tools') {
      for (const tool of tools) {
        expect(html.includes(`href="${tool.path}"`), tool.path).toBe(true);
      }
    }
  }

  expect(titles.size).toBe(paths.length);
  expect(descriptions.size).toBe(paths.length);
});
