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

  it('adds priority and change frequency hints by route type', () => {
    const map = sitemap();
    const findRoute = (path: string) => map.find((entry) => entry.url.endsWith(path));

    expect(findRoute('/')?.priority).toBe(1);
    expect(findRoute('/')?.changeFrequency).toBe('weekly');
    expect(findRoute('/topics/pdf-tools')?.priority).toBe(0.8);
    expect(findRoute('/pdf-tools/merge/merge-pdf')?.changeFrequency).toBe('monthly');
    expect(findRoute('/search')?.changeFrequency).toBe('yearly');
  });
});
