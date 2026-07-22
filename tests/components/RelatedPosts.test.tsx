import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockPosts = [
  {
    slug: 'post-1',
    title: 'مقاله اول',
    description: 'توضیح',
    category: 'ابزار',
    date: '2026-01-01',
    modifiedDate: '2026-01-01',
    author: 'نویسنده',
    tags: [],
    coverImage: '/images/cover.jpg',
    coverAlt: 'تصویر',
    imageCaption: '',
    published: true,
    series: null,
    seriesOrder: null,
    difficulty: null,
    featured: false,
    featuredRank: null,
    faq: [],
    relatedPosts: [],
    wordCount: 100,
  },
  {
    slug: 'post-2',
    title: 'مقاله دوم',
    description: 'توضیح',
    category: 'آموزشی',
    date: '2026-01-02',
    modifiedDate: '2026-01-02',
    author: 'نویسنده',
    tags: [],
    coverImage: '/images/cover.jpg',
    coverAlt: 'تصویر',
    imageCaption: '',
    published: true,
    series: null,
    seriesOrder: null,
    difficulty: null,
    featured: false,
    featuredRank: null,
    faq: [],
    relatedPosts: [],
    wordCount: 200,
  },
];

describe('RelatedPosts', () => {
  it('renders related posts section title', async () => {
    const { default: RelatedPosts } = await import('@/components/features/blog/RelatedPosts');
    render(<RelatedPosts posts={mockPosts} />);
    expect(screen.getByText(/مرتبط/)).toBeDefined();
  });

  it('renders all post titles', async () => {
    const { default: RelatedPosts } = await import('@/components/features/blog/RelatedPosts');
    render(<RelatedPosts posts={mockPosts} />);
    expect(screen.getByText('مقاله اول')).toBeDefined();
    expect(screen.getByText('مقاله دوم')).toBeDefined();
  });

  it('renders links to posts', async () => {
    const { default: RelatedPosts } = await import('@/components/features/blog/RelatedPosts');
    render(<RelatedPosts posts={mockPosts} />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(2);
  });

  it('renders nothing for empty posts', async () => {
    const { default: RelatedPosts } = await import('@/components/features/blog/RelatedPosts');
    const { container } = render(<RelatedPosts posts={[]} />);
    expect(container.innerHTML).toBe('');
  });
});
