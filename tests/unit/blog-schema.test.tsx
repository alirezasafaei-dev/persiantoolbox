import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import BlogPostSchema from '@/components/seo/BlogPostSchema';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

function extractJson(node: string): Record<string, unknown> | null {
  const match = node.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (!match?.[1]) {
    return null;
  }
  return JSON.parse(match[1]);
}

describe('BlogPostSchema', () => {
  it('renders Article schema with enriched fields', () => {
    const html = renderToStaticMarkup(
      <BlogPostSchema
        title="آزمون عنوان"
        description="توضیح"
        date="2026-06-24"
        author="تیم فنی"
        slug="test-post"
        coverImage="/images/blog/test.jpg"
        tags={['حقوق', 'مالی']}
      />,
    );
    const json = extractJson(html)!;
    expect(json['@type']).toBe('Article');
    expect(json['headline']).toBe('آزمون عنوان');
    expect(json['datePublished']).toBe('2026-06-24');
    expect(json['dateModified']).toBe('2026-06-24');
    expect(json['image']).toContain('test.jpg');
    expect((json['mainEntityOfPage'] as Record<string, unknown>)['@type']).toBe('WebPage');
    expect(json['keywords']).toBe('حقوق, مالی');
    expect(json['url'] as string).toContain('/blog/test-post');
  });

  it('uses dateModified override when provided', () => {
    const html = renderToStaticMarkup(
      <BlogPostSchema
        title="T"
        description="D"
        date="2026-06-01"
        author="a"
        slug="s"
        modifiedDate="2026-06-24"
      />,
    );
    const json = extractJson(html)!;
    expect(json['dateModified']).toBe('2026-06-24');
  });

  it('omits keywords when no tags provided', () => {
    const html = renderToStaticMarkup(
      <BlogPostSchema title="T" description="D" date="2026-06-01" author="a" slug="s" />,
    );
    const json = extractJson(html)!;
    expect(json['keywords']).toBeUndefined();
  });

  it('falls back to default OG image when no cover image', () => {
    const html = renderToStaticMarkup(
      <BlogPostSchema title="T" description="D" date="2026-06-01" author="a" slug="s" />,
    );
    const json = extractJson(html)!;
    expect(json['image']).toContain('og-default.png');
  });
});

describe('BreadcrumbSchema', () => {
  it('renders BreadcrumbList with correct positions', () => {
    const html = renderToStaticMarkup(
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: 'https://example.com' },
          { name: 'بلاگ', url: 'https://example.com/blog' },
        ]}
      />,
    );
    const json = extractJson(html)!;
    expect(json['@type']).toBe('BreadcrumbList');
    const items = json['itemListElement'] as Array<Record<string, unknown>>;
    expect(items).toHaveLength(2);
    expect(items[0]!['position']).toBe(1);
    expect(items[1]!['position']).toBe(2);
    expect(items[0]!['name']).toBe('خانه');
  });

  it('renders nothing when items is empty', () => {
    const html = renderToStaticMarkup(<BreadcrumbSchema items={[]} />);
    expect(html.trim()).toBe('');
  });
});
