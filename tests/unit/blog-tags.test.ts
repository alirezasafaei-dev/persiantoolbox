import { describe, it, expect } from 'vitest';
import {
  getAllPosts,
  getAllTags,
  getTagsWithCount,
  getPostsByTag,
  getAllTagsForStaticParams,
  getPopularPosts,
  getFeaturedPost,
} from '@/lib/blog';

describe('blog tag functions', () => {
  const posts = getAllPosts();
  const allTags = getAllTags();

  it('getTagsWithCount returns tags sorted by count desc', () => {
    const tags = getTagsWithCount();
    expect(tags.length).toBe(allTags.length);
    for (const t of tags) {
      expect(typeof t.count).toBe('number');
      expect(t.count).toBeGreaterThan(0);
    }
    // sorted descending by count
    for (let i = 1; i < tags.length; i++) {
      expect(tags[i - 1]?.count ?? 0).toBeGreaterThanOrEqual(tags[i]?.count ?? 0);
    }
  });

  it('getPostsByTag returns posts containing that tag', () => {
    const tag = allTags[0];
    if (!tag) {
      return;
    }
    const result = getPostsByTag(tag);
    expect(result.length).toBeGreaterThan(0);
    for (const post of result) {
      expect(post.tags).toContain(tag);
    }
  });

  it('getPostsByTag returns empty for unknown tag', () => {
    expect(getPostsByTag('__nonexistent_tag__')).toEqual([]);
  });

  it('getTagsWithCount count matches getPostsByTag length', () => {
    for (const { tag, count } of getTagsWithCount()) {
      expect(getPostsByTag(tag).length).toBe(count);
    }
  });

  it('getAllTagsForStaticParams returns same tags as getTagsWithCount', () => {
    expect(getAllTagsForStaticParams()).toEqual(getTagsWithCount().map((t) => t.tag));
  });

  it('getPopularPosts respects limit', () => {
    const popular = getPopularPosts(3);
    expect(popular.length).toBeLessThanOrEqual(3);
    const popularAll = getPopularPosts(posts.length + 10);
    expect(popularAll.length).toBeLessThanOrEqual(posts.length);
  });

  it('getFeaturedPost returns newest post when posts exist', () => {
    if (posts.length === 0) {
      return;
    }
    const featured = getFeaturedPost();
    expect(featured).not.toBeNull();
    const newest = posts.reduce((acc, p) => (p.date > acc.date ? p : acc));
    expect(featured?.slug).toBe(newest.slug);
  });
});
