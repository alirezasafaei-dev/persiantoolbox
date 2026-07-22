import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BlogPreviewSection from '@/components/home/BlogPreviewSection';

vi.mock('@/lib/blog', () => ({
  getAllPosts: () => [
    {
      slug: 'loan-guide',
      title: 'راهنمای محاسبه وام',
      description: 'آموزش محاسبه اقساط',
      date: '2026-07-20',
      category: 'مالی',
      coverImage: '/images/blog/loan/cover.svg',
      tags: ['وام', 'محاسبه'],
      wordCount: 1200,
    },
    {
      slug: 'invoice-guide',
      title: 'راهنمای فاکتور',
      description: 'آموزش صدور فاکتور',
      date: '2026-07-19',
      category: 'ابزار',
      coverImage: '/images/blog/invoice/cover.svg',
      tags: ['فاکتور'],
      wordCount: 800,
    },
  ],
  getHomepagePreviewPosts: () => [
    {
      slug: 'loan-guide',
      title: 'راهنمای محاسبه وام',
      description: 'آموزش محاسبه اقساط',
      date: '2026-07-20',
      category: 'مالی',
      coverImage: '/images/blog/loan/cover.svg',
      tags: ['وام', 'محاسبه'],
      wordCount: 1200,
    },
    {
      slug: 'invoice-guide',
      title: 'راهنمای فاکتور',
      description: 'آموزش صدور فاکتور',
      date: '2026-07-19',
      category: 'ابزار',
      coverImage: '/images/blog/invoice/cover.svg',
      tags: ['فاکتور'],
      wordCount: 800,
    },
  ],
}));

describe('BlogPreviewSection', () => {
  it('renders section title', () => {
    render(<BlogPreviewSection />);
    expect(screen.getByText(/از بلاگ ما/)).toBeDefined();
  });

  it('renders article titles', () => {
    render(<BlogPreviewSection />);
    expect(screen.getByText('راهنمای محاسبه وام')).toBeDefined();
    expect(screen.getByText('راهنمای فاکتور')).toBeDefined();
  });

  it('renders article links', () => {
    render(<BlogPreviewSection />);
    const links = screen.getAllByRole('link');
    const blogLinks = links.filter((l) => l.getAttribute('href')?.includes('/blog/'));
    expect(blogLinks.length).toBe(2);
  });

  it('renders category badges', () => {
    render(<BlogPreviewSection />);
    expect(screen.getByText('مالی')).toBeDefined();
    expect(screen.getByText('ابزار')).toBeDefined();
  });
});
