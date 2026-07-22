import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { getAllTags } from '@/lib/blog';

const root = process.cwd();
const readSource = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('GSC canonical source contracts', () => {
  it('does not emit the retired sitelinks SearchAction template in HomePage', () => {
    const source = readSource('components/HomePage.tsx');

    expect(source).not.toContain('{search_term_string}');
  });

  it('normalizes all published blog tags before route generation', () => {
    const tags = getAllTags();

    expect(tags.length).toBeGreaterThan(0);
    expect(tags.every((tag) => tag.length > 0 && tag === tag.trim())).toBe(true);
    expect(tags).toContain('استخدام');
    expect(tags).not.toContain(' استخدام');
  });

  it('permanently redirects whitespace tag variants to the clean route', () => {
    const routeSource = readSource('app/blog/tag/[tag]/page.tsx');

    expect(routeSource).toContain('permanentRedirect');
    expect(routeSource).toContain('rawTag.trim()');
    expect(routeSource).toContain('encodeURIComponent(tag)');
  });

  it('excludes permanent redirect sources from the sitemap', () => {
    const urls = new Set(sitemap().map((entry) => entry.url));
    const redirectedAliases = [
      '/topics/pdf-tools',
      '/topics/image-tools',
      '/topics/date-tools',
      '/topics/text-tools',
      '/topics/finance-tools',
    ];

    for (const route of redirectedAliases) {
      expect([...urls].some((url) => url.endsWith(route))).toBe(false);
    }
  });
});
