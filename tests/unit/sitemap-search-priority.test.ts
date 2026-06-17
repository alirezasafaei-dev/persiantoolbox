import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';

describe('sitemap search and priority', () => {
  it('excludes /search route from sitemap', () => {
    const map = sitemap();
    const urls = map.map((entry) => entry.url);

    expect(urls.some((url) => url.endsWith('/search'))).toBe(false);
  });

  it('assigns highest priority to root route', () => {
    const map = sitemap();
    const rootEntry = map.find(
      (entry) => entry.url.replace(/\/$/, '') === '' || entry.url.endsWith('/'),
    );

    expect(rootEntry).toBeDefined();
    expect(rootEntry?.priority).toBe(1.0);
  });

  it('assigns proper priority to tool routes', () => {
    const map = sitemap();
    const pdfToolsEntry = map.find((entry) => entry.url.endsWith('/pdf-tools'));

    expect(pdfToolsEntry).toBeDefined();
    expect(pdfToolsEntry?.priority).toBeGreaterThan(0);
    expect(['daily', 'weekly', 'monthly']).toContain(pdfToolsEntry?.changeFrequency);
  });

  it('includes priority and changeFrequency for all routes', () => {
    const map = sitemap();

    for (const entry of map) {
      expect(entry.priority).toBeDefined();
      expect(typeof entry.priority).toBe('number');
      expect(entry.priority).toBeGreaterThanOrEqual(0);
      expect(entry.priority).toBeLessThanOrEqual(1);

      expect(entry.changeFrequency).toBeDefined();
      expect(['daily', 'weekly', 'monthly', 'yearly']).toContain(entry.changeFrequency);
    }
  });
});
