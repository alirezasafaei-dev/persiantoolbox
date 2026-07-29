import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { getAllTags } from '@/lib/blog';

const root = process.cwd();
const readSource = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

function sourceFiles(relativeDirectory: string): string[] {
  const directory = path.join(root, relativeDirectory);
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeDirectory, entry.name);
    return entry.isDirectory() ? sourceFiles(relativePath) : [relativePath];
  });
}

const SEO_SOURCE_DIRECTORIES = ['app', 'components', 'content', 'lib'];
const SEO_SOURCE_EXTENSIONS = new Set(['.md', '.mdx', '.ts', '.tsx']);

function seoSources() {
  return SEO_SOURCE_DIRECTORIES.flatMap(sourceFiles)
    .filter((relativePath) => SEO_SOURCE_EXTENSIONS.has(path.extname(relativePath)))
    .map((relativePath) => ({ relativePath, source: readSource(relativePath) }));
}

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

  it('rejects malformed, unresolved, and method-suffixed SEO URLs in source-controlled content', () => {
    const forbidden = [
      { name: 'regex fragments in tool URLs', pattern: /\/tools\/\[\^['"]?\]\*/ },
      { name: 'the unresolved provider placeholder', pattern: /\$\{provider\.id\}/ },
      {
        name: 'literal placeholder URL segments',
        pattern: /\/(?:robots\.txt|feed\.xml|sitemap\.xml)GET\b/,
      },
      {
        name: 'method suffixes on crawler URLs',
        pattern: /\/(?:robots\.txt|feed\.xml|sitemap\.xml)(?:GET|POST|PUT|DELETE)\b/,
      },
    ];

    const violations = seoSources().flatMap(({ relativePath, source }) =>
      forbidden
        .filter(({ pattern }) => pattern.test(source))
        .map(({ name }) => `${relativePath}: ${name}`),
    );

    expect(violations).toEqual([]);
  });

  it('keeps the three affected HowTo JSON-LD URLs canonical', () => {
    expect(readSource('app/(tools)/tools/vat-calculator/page.tsx')).toContain(
      'url: `${siteUrl}/tools/vat-calculator`',
    );
    expect(readSource('app/(tools)/tools/report-generator/page.tsx')).toContain(
      'url: `${siteUrl}/tools/report-generator`',
    );
    expect(readSource('app/(tools)/tools/tax-calculator/page.tsx')).toContain(
      'url: `${siteUrl}/tools/tax-calculator`',
    );
  });

  it('uses ImageResponse-supported display values in the nested blog Open Graph route', () => {
    const source = readSource('app/blog/[slug]/opengraph-image.tsx');

    expect(source).not.toContain("display: 'inline-flex'");
    expect(source).toContain("display: 'flex'");
  });
});
