import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomeHero from '@/components/home/HomeHero';

vi.mock('@/lib/home-copy', () => ({
  getHomeHeroCopy: () => ({
    eyebrow: '۸۶+ ابزار رایگان · شروع فوری',
    title: 'ابزارهای فارسی برای کارهای روزمره',
    titleAccent: 'سریع، شفاف، بدون نصب',
    subtitle:
      'محاسبه وام و حقوق، تبدیل تاریخ، فشرده‌سازی PDF، فاکتور، رزومه و ویرایش متن — جعبه ابزار فارسی.',
    primaryCta: 'جستجوی ابزار',
    secondaryCtaLabel: 'ابزارهای پیشنهادی',
    trustPills: ['بدون ثبت‌نام', 'پردازش محلی', 'شفافیت فنی'],
  }),
  getHomeToolCount: () => 86,
}));

vi.mock('@/shared/ui/icons', () => ({
  IconCheck: ({ className }: { className?: string }) => <span className={className}>✓</span>,
}));

vi.mock('@/components/home/HeroQuickLinks', () => ({
  default: () => <div data-testid="hero-quick-links" />,
}));

vi.mock('@/components/home/LazyToolSearch', () => ({
  default: () => <div data-testid="lazy-tool-search" />,
}));

describe('HomeHero', () => {
  it('renders main heading', () => {
    render(<HomeHero toolCount={86} />);
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
  });

  it('renders description text', () => {
    render(<HomeHero toolCount={86} />);
    expect(screen.getByText(/جعبه ابزار فارسی/)).toBeDefined();
  });

  it('renders CTA buttons', () => {
    render(<HomeHero toolCount={86} />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
