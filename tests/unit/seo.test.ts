import { describe, it, expect, vi } from 'vitest';

describe('buildMetadata', () => {
  it('builds absolute canonical and openGraph URLs', async () => {
    const original = process.env['NEXT_PUBLIC_SITE_URL'];
    process.env['NEXT_PUBLIC_SITE_URL'] = 'https://example.com';

    vi.resetModules();
    const { buildMetadata } = await import('@/lib/seo');

    const meta = buildMetadata({
      title: 'Test',
      description: 'Desc',
      path: '/tools',
    });

    expect(meta.alternates?.canonical).toBe('https://example.com/tools');
    expect(meta.openGraph?.url).toBe('https://example.com/tools');

    if (original === undefined) {
      delete process.env['NEXT_PUBLIC_SITE_URL'];
    } else {
      process.env['NEXT_PUBLIC_SITE_URL'] = original;
    }
  });

  it('infers article images for blog post metadata', async () => {
    const original = process.env['NEXT_PUBLIC_SITE_URL'];
    process.env['NEXT_PUBLIC_SITE_URL'] = 'https://example.com';

    vi.resetModules();
    const { buildMetadata } = await import('@/lib/seo');

    const meta = buildMetadata({
      title: 'SEO فارسی',
      description: 'Desc',
      path: '/blog/seo-iran-guide',
    });

    expect(meta.openGraph?.images?.[0]?.url).toBe(
      'https://example.com/images/blog/seo-iran-guide.svg',
    );
    expect(meta.twitter?.images?.[0]).toBe('https://example.com/images/blog/seo-iran-guide.svg');

    if (original === undefined) {
      delete process.env['NEXT_PUBLIC_SITE_URL'];
    } else {
      process.env['NEXT_PUBLIC_SITE_URL'] = original;
    }
  });
});
