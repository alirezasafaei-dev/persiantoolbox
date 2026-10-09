import { describe, expect, it, vi } from 'vitest';
import { getAllCategories, getAllPosts, getPublishedPostsByCategory } from '@/lib/blog';
import { Children, isValidElement, type ReactNode } from 'react';
import BlogPostPage from '@/app/blog/[slug]/page';
import { getCategoryRoute } from '@/lib/blog-normalize';
import sitemap from '@/app/sitemap';
import BlogCategoryPage, { generateMetadata } from '@/app/blog/category/[category]/page';

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND');
  },
  permanentRedirect: (path: string) => {
    throw new Error(`PERMANENT_REDIRECT:${path}`);
  },
}));

const aliases = [
  ['نگارش', 'متن'],
  ['راهنماها', 'راهنما'],
  ['آموزش', 'آموزشی'],
] as const;

function collectProps(node: ReactNode): Array<Record<string, unknown>> {
  const props: Array<Record<string, unknown>> = [];
  Children.forEach(node, (child) => {
    if (isValidElement<{ children?: ReactNode }>(child)) {
      props.push(child.props);
      props.push(...collectProps(child.props.children));
    }
  });
  return props;
}

describe('duplicate blog category consolidation', () => {
  it.each(aliases)(
    'links articles in %s directly to %s in UI and structured breadcrumbs',
    async (alias, primary) => {
      const post = getAllPosts().find((item) => item.category === alias);
      expect(post).toBeDefined();
      const props = collectProps(
        await BlogPostPage({ params: Promise.resolve({ slug: post!.slug }) }),
      );
      const primaryPath = `/blog/category/${encodeURIComponent(primary)}`;
      expect(props.some((item) => item['href'] === primaryPath)).toBe(true);
      const items = props.find((item) => Array.isArray(item['items']))?.['items'] as Array<{
        url?: string;
      }>;
      expect(items[2]?.url).toBe(`https://persiantoolbox.ir${primaryPath}`);
    },
  );

  it.each(aliases)('consolidates %s into the existing %s category', async (alias, primary) => {
    const primaryPath = `/blog/category/${encodeURIComponent(primary)}`;
    const posts = getPublishedPostsByCategory(primary);
    expect(posts.length).toBeGreaterThan(0);
    expect(getPublishedPostsByCategory(alias).map((post) => post.slug)).toEqual(
      posts.map((post) => post.slug),
    );
    expect(getCategoryRoute(alias)).toBe(primaryPath);
    expect(getCategoryRoute(primary)).toBe(primaryPath);
    expect(getAllCategories()).toContain(primary);
    expect(getAllCategories()).not.toContain(alias);
    const metadata = await generateMetadata({
      params: Promise.resolve({ category: encodeURIComponent(alias) }),
    });
    expect(metadata.alternates?.canonical).toBe(`https://persiantoolbox.ir${primaryPath}`);
    await expect(
      BlogCategoryPage({ params: Promise.resolve({ category: alias }) }),
    ).rejects.toThrow(`PERMANENT_REDIRECT:${primaryPath}`);
  });

  it('keeps only primary category URLs in the sitemap with the latest date across aliases', () => {
    const entries = sitemap();
    for (const [alias, primary] of aliases) {
      expect(
        entries.some((entry) => decodeURI(entry.url).endsWith(`/blog/category/${alias}`)),
      ).toBe(false);
      const entry = entries.find((item) =>
        decodeURI(item.url).endsWith(`/blog/category/${primary}`),
      );
      expect(entry).toBeDefined();
      const latest = getPublishedPostsByCategory(primary)
        .map((post) => post.modifiedDate || post.date)
        .sort()
        .at(-1);
      expect(new Date(entry!.lastModified!).toISOString().slice(0, 10)).toBe(latest);
    }
  });

  it('preserves unrelated category routes and not-found behavior', async () => {
    expect(getCategoryRoute('مالی')).toBe(`/blog/category/${encodeURIComponent('مالی')}`);
    await expect(
      BlogCategoryPage({ params: Promise.resolve({ category: 'missing-category-test' }) }),
    ).rejects.toThrow('NOT_FOUND');
  });
});
