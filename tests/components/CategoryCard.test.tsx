import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryCard from '@/components/home/CategoryCard';

vi.mock('@/lib/category-catalog', () => ({
  getCategoryCatalogEntry: () => ({
    id: 'text-tools',
    shortName: 'متنی',
    tagline: 'ابزارهای پردازش متن',
    description: 'ابزارهای پردازش متن',
    icon: '📝',
    accent: 'from-blue-500 to-cyan-500',
    groupId: 'compute',
    sortOrder: 1,
    topicsPath: '/topics/text',
  }),
  getCategoryGroup: () => ({
    id: 'compute',
    title: 'محاسبه و داده',
    description: 'desc',
  }),
  getCategoryLandingPath: () => '/text-tools',
}));

vi.mock('@/lib/tools-registry', () => ({
  getToolsByCategory: () => [
    { id: 'tool1', title: 'ابزار اول - جعبه ابزار فارسی', path: '/tools/1', description: 'desc' },
  ],
  getCategoryDisplayCount: () => 10,
}));

describe('CategoryCard', () => {
  it('renders category name', () => {
    render(<CategoryCard categoryId="text-tools" />);
    expect(screen.getByText(/متنی/)).toBeDefined();
  });

  it('renders description', () => {
    render(<CategoryCard categoryId="text-tools" />);
    expect(screen.getByText(/ابزارهای پردازش متن/)).toBeDefined();
  });

  it('renders link to category', () => {
    render(<CategoryCard categoryId="text-tools" />);
    const link = screen.getByRole('link', { name: /همه ابزارهای رایگان/ });
    expect(link).toHaveAttribute('href', '/text-tools');
  });

  it('renders tool count', () => {
    render(<CategoryCard categoryId="text-tools" />);
    expect(screen.getByText(/۱۰ ابزار/)).toBeDefined();
  });
});
