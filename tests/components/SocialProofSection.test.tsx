import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SocialProofSection from '@/components/home/SocialProofSection';

vi.mock('@/lib/stats', () => ({
  publicStats: {
    activeUsers: 10000,
    exportsGenerated: 50000,
    articlesPublished: 120,
    toolsAvailable: 103,
  },
}));

describe('SocialProofSection', () => {
  it('renders stat labels', () => {
    render(<SocialProofSection />);
    expect(screen.getByText(/کاربر فعال/)).toBeDefined();
    expect(screen.getByText(/خروجی ساخته شده/)).toBeDefined();
    expect(screen.getByText(/مقاله آموزشی/)).toBeDefined();
    expect(screen.getByText(/ابزار رایگان/)).toBeDefined();
  });

  it('renders stat values', () => {
    render(<SocialProofSection />);
    const counterSpans = screen.getAllByText(/\+۰/);
    expect(counterSpans.length).toBe(4);
  });
});
