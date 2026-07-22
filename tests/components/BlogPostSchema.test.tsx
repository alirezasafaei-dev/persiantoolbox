import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import BlogPostSchema from '@/components/seo/BlogPostSchema';

vi.mock('@/lib/seo', () => ({
  siteUrl: 'https://persiantoolbox.ir',
}));

vi.mock('@/lib/blog-authors', () => ({
  getAuthorByName: (name: string) => {
    if (name === 'تیم فارسی') return { id: 'team-farsi', name: 'تیم فارسی' };
    return null;
  },
}));

const mockPost = {
  title: 'راهنمای محاسبه وام',
  slug: 'loan-guide',
  description: 'آموزش محاسبه اقساط وام',
  date: '2026-07-20',
  author: 'تیم فارسی',
  category: 'مالی',
  coverImage: '/images/blog/loan/cover.svg',
};

describe('BlogPostSchema', () => {
  it('renders valid BlogPosting JSON-LD', () => {
    const { container } = render(
      <BlogPostSchema
        title={mockPost.title}
        slug={mockPost.slug}
        description={mockPost.description}
        date={mockPost.date}
        author={mockPost.author}
        coverImage={mockPost.coverImage}
        category={mockPost.category}
      />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeDefined();
    const data = JSON.parse(script!.textContent!);
    expect(data['@type']).toBe('BlogPosting');
    expect(data.headline).toBe('راهنمای محاسبه وام');
  });

  it('includes author information', () => {
    const { container } = render(
      <BlogPostSchema
        title={mockPost.title}
        slug={mockPost.slug}
        description={mockPost.description}
        date={mockPost.date}
        author={mockPost.author}
        coverImage={mockPost.coverImage}
      />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script!.textContent!);
    expect(data.author.name).toBe('تیم فارسی');
  });

  it('includes date published', () => {
    const { container } = render(
      <BlogPostSchema
        title={mockPost.title}
        slug={mockPost.slug}
        description={mockPost.description}
        date={mockPost.date}
        author={mockPost.author}
        coverImage={mockPost.coverImage}
      />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script!.textContent!);
    expect(data.datePublished).toBe('2026-07-20');
  });

  it('includes image', () => {
    const { container } = render(
      <BlogPostSchema
        title={mockPost.title}
        slug={mockPost.slug}
        description={mockPost.description}
        date={mockPost.date}
        author={mockPost.author}
        coverImage={mockPost.coverImage}
      />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script!.textContent!);
    expect(data.image).toContain('cover.svg');
  });
});
