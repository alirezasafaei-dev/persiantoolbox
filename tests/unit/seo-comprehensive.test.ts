import { describe, it, expect, vi } from 'vitest';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';

describe('SEO comprehensive checks', () => {
  describe('sitemap', () => {
    it('excludes /search from sitemap', () => {
      const map = sitemap();
      const urls = map.map((entry) => entry.url);
      expect(urls.some((url) => url.endsWith('/search'))).toBe(false);
    });

    it('includes homepage with highest priority', () => {
      const map = sitemap();
      const home = map.find(
        (entry) => entry.url.replace(/\/$/, '') === '' || entry.url.endsWith('/'),
      );
      expect(home).toBeDefined();
      expect(home?.priority).toBe(1.0);
    });

    it('all routes have valid priority and changeFrequency', () => {
      const map = sitemap();
      for (const entry of map) {
        expect(typeof entry.priority).toBe('number');
        expect(entry.priority).toBeGreaterThanOrEqual(0);
        expect(entry.priority).toBeLessThanOrEqual(1);
        expect(['daily', 'weekly', 'monthly', 'yearly']).toContain(entry.changeFrequency);
      }
    });

    it('does not include duplicate URLs', () => {
      const map = sitemap();
      const urls = map.map((entry) => entry.url);
      const unique = new Set(urls);
      expect(urls.length).toBe(unique.size);
    });
  });

  describe('robots.txt', () => {
    it('disallows /admin/', () => {
      const config = robots();
      const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
      const disallow = (rules[0] as { disallow?: string | string[] })?.disallow ?? [];
      expect(disallow).toContain('/admin/');
    });

    it('disallows /api/', () => {
      const config = robots();
      const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
      const disallow = (rules[0] as { disallow?: string | string[] })?.disallow ?? [];
      expect(disallow).toContain('/api/');
    });

    it('disallows /search?', () => {
      const config = robots();
      const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
      const disallow = (rules[0] as { disallow?: string | string[] })?.disallow ?? [];
      expect(disallow).toContain('/search?');
    });

    it('points to sitemap', () => {
      const config = robots();
      expect(config.sitemap).toBeDefined();
      expect(config.sitemap).toContain('sitemap.xml');
    });

    it('has host defined', () => {
      const config = robots();
      expect(config.host).toBeDefined();
    });
  });

  describe('buildMetadata', () => {
    it('builds canonical URL', async () => {
      const original = process.env['NEXT_PUBLIC_SITE_URL'];
      process.env['NEXT_PUBLIC_SITE_URL'] = 'https://example.com';

      vi.resetModules();
      const { buildMetadata } = await import('@/lib/seo');

      const meta = buildMetadata({
        title: 'Test',
        description: 'Desc',
        path: '/loan',
      });

      expect(meta.alternates?.canonical).toBe('https://example.com/loan');

      if (original === undefined) {
        delete process.env['NEXT_PUBLIC_SITE_URL'];
      } else {
        process.env['NEXT_PUBLIC_SITE_URL'] = original;
      }
    });

    it('passes robots option to metadata', async () => {
      const original = process.env['NEXT_PUBLIC_SITE_URL'];
      process.env['NEXT_PUBLIC_SITE_URL'] = 'https://example.com';

      vi.resetModules();
      const { buildMetadata } = await import('@/lib/seo');

      const meta = buildMetadata({
        title: 'Search',
        description: 'Desc',
        path: '/search',
        robots: { index: false, follow: true },
      });

      expect(meta.robots).toEqual({ index: false, follow: true });

      if (original === undefined) {
        delete process.env['NEXT_PUBLIC_SITE_URL'];
      } else {
        process.env['NEXT_PUBLIC_SITE_URL'] = original;
      }
    });

    it('omits robots when not provided', async () => {
      const original = process.env['NEXT_PUBLIC_SITE_URL'];
      process.env['NEXT_PUBLIC_SITE_URL'] = 'https://example.com';

      vi.resetModules();
      const { buildMetadata } = await import('@/lib/seo');

      const meta = buildMetadata({
        title: 'Test',
        description: 'Desc',
        path: '/loan',
      });

      expect(meta.robots).toBeUndefined();

      if (original === undefined) {
        delete process.env['NEXT_PUBLIC_SITE_URL'];
      } else {
        process.env['NEXT_PUBLIC_SITE_URL'] = original;
      }
    });

    it('includes keywords when provided', async () => {
      const original = process.env['NEXT_PUBLIC_SITE_URL'];
      process.env['NEXT_PUBLIC_SITE_URL'] = 'https://example.com';

      vi.resetModules();
      const { buildMetadata } = await import('@/lib/seo');

      const meta = buildMetadata({
        title: 'Test',
        description: 'Desc',
        path: '/loan',
        keywords: ['وام', 'محاسبه'],
      });

      expect(meta.keywords).toEqual(['وام', 'محاسبه']);

      if (original === undefined) {
        delete process.env['NEXT_PUBLIC_SITE_URL'];
      } else {
        process.env['NEXT_PUBLIC_SITE_URL'] = original;
      }
    });
  });

  describe('tools-registry i18n', () => {
    it('date-difference title has no Chinese characters', async () => {
      const { getToolByPathOrThrow } = await import('@/lib/tools-registry');
      const tool = getToolByPathOrThrow('/date-tools/date-difference');
      expect(tool.title).not.toMatch(/[\u4e00-\u9fff]/);
      expect(tool.title).toContain('اختلاف');
    });

    it('date-difference keywords have no Chinese characters', async () => {
      const { getToolByPathOrThrow } = await import('@/lib/tools-registry');
      const tool = getToolByPathOrThrow('/date-tools/date-difference');
      const hasChinese = tool.keywords?.some((kw) => /[\u4e00-\u9fff]/.test(kw));
      expect(hasChinese).toBe(false);
    });

    it('all tool titles have no Chinese characters', async () => {
      const { getIndexableTools } = await import('@/lib/tools-registry');
      const tools = getIndexableTools();
      for (const tool of tools) {
        expect(tool.title).not.toMatch(/[\u4e00-\u9fff]/);
      }
    });
  });
});
