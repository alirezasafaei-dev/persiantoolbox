import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TrustStats from '@/components/home/TrustStats';

vi.mock('@/shared/analytics/localUsage', () => ({
  getUsageSnapshot: () => ({ paths: {} }),
}));

vi.mock('@/shared/ui/icons', () => {
  const icon = ({ className }: { className?: string }) => <span className={className}>*</span>;
  return { IconShield: icon, IconZap: icon, IconPdf: icon };
});

describe('TrustStats', () => {
  it('renders trust statistics', () => {
    render(<TrustStats toolsCount={86} />);
    expect(screen.getByText(/رایگان/)).toBeDefined();
  });

  it('renders multiple stats', () => {
    render(<TrustStats toolsCount={86} />);
    const items = screen.getAllByText(/\d+/);
    expect(items.length).toBeGreaterThan(0);
  });
});
