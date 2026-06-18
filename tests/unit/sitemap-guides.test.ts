import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { guidePages } from '@/lib/guide-pages';

describe('sitemap guides coverage', () => {
  it('includes guides index and guide detail routes', () => {
    const map = sitemap();
    const urls = map.map((entry) => entry.url);

    expect(urls.some((url) => url.endsWith('/guides'))).toBe(true);
    for (const guide of guidePages) {
      expect(urls.some((url) => url.endsWith(`/guides/${guide.slug}`))).toBe(true);
    }
  });
});
