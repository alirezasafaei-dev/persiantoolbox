import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PopularToolsSection from '@/components/home/PopularToolsSection';

vi.mock('@/lib/home-copy', () => ({
  getHomeSectionCopy: () => ({
    categories: { title: '', subtitle: '', cta: '' },
    popular: { title: 'ابزارهای پیشنهادی رایگان', subtitle: 'مسیرهای منتخب برای شروع سریع' },
    newest: { title: '', subtitle: '' },
    useCases: { title: '', subtitle: '' },
    audiences: { title: '', subtitle: '' },
  }),
}));

vi.mock('@/shared/ui/icons', () => {
  const icon = ({ className }: { className?: string }) => <span className={className}>*</span>;
  return { IconMoney: icon, IconCalendar: icon, IconPdf: icon };
});

describe('PopularToolsSection', () => {
  it('renders section title', () => {
    render(<PopularToolsSection />);
    expect(screen.getByText(/ابزارهای پیشنهادی/)).toBeDefined();
  });

  it('renders tool links', () => {
    render(<PopularToolsSection />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('renders tool names', () => {
    render(<PopularToolsSection />);
    expect(screen.getByText(/محاسبه اقساط وام/)).toBeDefined();
  });
});
