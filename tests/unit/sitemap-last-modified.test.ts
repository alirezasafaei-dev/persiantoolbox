import { afterEach, describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';

const originalBuildDate = process.env['NEXT_PUBLIC_BUILD_DATE'];

afterEach(() => {
  if (originalBuildDate === undefined) {
    delete process.env['NEXT_PUBLIC_BUILD_DATE'];
  } else {
    process.env['NEXT_PUBLIC_BUILD_DATE'] = originalBuildDate;
  }
});

describe('sitemap lastModified integrity', () => {
  it('does not stamp static routes with the build date', () => {
    process.env['NEXT_PUBLIC_BUILD_DATE'] = '2099-12-31';
    const entries = sitemap();
    const staticEntry = entries.find((entry) => entry.url.endsWith('/about'));
    const homeEntry = entries.find((entry) => entry.url.endsWith('/'));

    expect(staticEntry).toBeDefined();
    expect(staticEntry).not.toHaveProperty('lastModified');
    expect(homeEntry).toBeDefined();
    expect(homeEntry).not.toHaveProperty('lastModified');
  });

  it('preserves maintained tool and blog dates', () => {
    const entries = sitemap();
    const addressTool = entries.find((entry) => entry.url.endsWith('/text-tools/address-fa-to-en'));
    const datedBlogPost = entries.find(
      (entry) => entry.url.includes('/blog/') && entry.lastModified !== undefined,
    );

    expect(addressTool?.lastModified).toBeTruthy();
    expect(datedBlogPost?.lastModified).toBeTruthy();
  });

  it('derives blog-index freshness from real post dates', () => {
    const entries = sitemap();
    const blogIndex = entries.find((entry) => entry.url.endsWith('/blog'));

    expect(blogIndex?.lastModified).toBeTruthy();
    expect(String(blogIndex?.lastModified)).not.toBe('2099-12-31');
  });

  it('does not publish topic aliases that permanently redirect', () => {
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
