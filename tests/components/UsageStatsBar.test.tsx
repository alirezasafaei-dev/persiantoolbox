import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UsageStatsBar from '@/components/home/UsageStatsBar';

vi.mock('@/shared/ui/icons', () => {
  const icon = ({ className }: { className?: string }) => <span className={className}>*</span>;
  return { IconZap: icon, IconShield: icon, IconStar: icon };
});

describe('UsageStatsBar', () => {
  it('renders usage statistics', () => {
    render(<UsageStatsBar toolsCount={86} postsCount={126} />);
    expect(screen.getByText(/ابزار فعال/)).toBeDefined();
  });

  it('renders stat numbers', () => {
    render(<UsageStatsBar toolsCount={86} postsCount={126} />);
    expect(screen.getByText(/۸۶/)).toBeDefined();
  });
});
