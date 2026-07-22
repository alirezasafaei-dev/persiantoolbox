import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryGrid from '@/components/home/CategoryGrid';

vi.mock('@/lib/home-copy', () => ({
  getHomeSectionCopy: () => ({
    categories: {
      title: 'همه مسیرهای ابزارهای رایگان فارسی',
      subtitle: '۸۶+ ابزار رایگان در ۳ گروه و ۸ دسته تخصصی',
      cta: 'مشاهده نقشه کامل ابزارهای رایگان',
    },
    popular: { title: 'ابزارهای پیشنهادی رایگان', subtitle: '' },
    newest: { title: 'ابزارهای جدید', subtitle: '' },
    useCases: { title: '', subtitle: '' },
    audiences: { title: '', subtitle: '' },
  }),
}));

vi.mock('@/lib/category-catalog', () => ({
  categoryGroups: [
    { id: 'media', title: 'فایل و رسانه', description: 'desc' },
    { id: 'compute', title: 'محاسبه و داده', description: 'desc' },
  ],
  getCategoriesByGroup: () => [],
  getCategoryCatalogEntry: () => null,
  getCategoryGroup: () => null,
  getCategoryLandingPath: () => '/',
}));

describe('CategoryGrid', () => {
  it('renders category cards', () => {
    render(<CategoryGrid />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('renders category names', () => {
    render(<CategoryGrid />);
    expect(screen.getByText(/ابزارهای رایگان فارسی/)).toBeDefined();
  });

  it('renders links to category pages', () => {
    render(<CategoryGrid />);
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs.some((h) => h === '/topics')).toBe(true);
  });
});
