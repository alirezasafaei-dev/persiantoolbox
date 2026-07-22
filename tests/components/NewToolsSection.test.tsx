import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NewToolsSection from '@/components/home/NewToolsSection';

vi.mock('@/lib/home-copy', () => ({
  getHomeSectionCopy: () => ({
    categories: { title: '', subtitle: '', cta: '' },
    popular: { title: '', subtitle: '' },
    newest: { title: 'ابزارهای جدید', subtitle: 'تازه‌ترین ابزارهای اضافه‌شده' },
    useCases: { title: '', subtitle: '' },
    audiences: { title: '', subtitle: '' },
  }),
}));

vi.mock('@/lib/tools-registry', () => ({
  getNewestTools: () => [
    {
      path: '/tools/new1',
      title: 'ابزار جدید اول',
      description: 'توضیح اول',
      category: { id: 'text-tools', name: 'متنی' },
    },
    {
      path: '/tools/new2',
      title: 'ابزار جدید دوم',
      description: 'توضیح دوم',
      category: { id: 'finance-tools', name: 'مالی' },
    },
  ],
}));

vi.mock('@/shared/ui/icons', () => {
  const icon = ({ className }: { className?: string }) => <span className={className}>*</span>;
  return {
    IconPdf: icon,
    IconImage: icon,
    IconMoney: icon,
    IconCalendar: icon,
    IconCalculator: icon,
    IconShield: icon,
    IconZap: icon,
  };
});

describe('NewToolsSection', () => {
  it('renders section title', () => {
    render(<NewToolsSection />);
    expect(screen.getByText(/ابزارهای جدید/)).toBeDefined();
  });

  it('renders tool links', () => {
    render(<NewToolsSection />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
