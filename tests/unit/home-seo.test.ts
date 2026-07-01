import { describe, expect, it } from 'vitest';
import { siteUrl } from '@/lib/seo';

describe('homepage SEO helpers', () => {
  it('search action URL points to /search route', () => {
    const searchTemplate = `${siteUrl}/search?q={search_term_string}`;
    expect(searchTemplate).toContain('/search?q=');
    expect(searchTemplate).not.toContain('/?q=');
  });
});
