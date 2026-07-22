import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import FeedbackSurvey from '@/components/home/FeedbackSurvey';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('@/lib/client/popupEngagement', () => ({
  getEngagementCount: () => 100,
  isPopupExcludedPath: () => false,
  POPUP_THRESHOLDS: { ACCOUNT_ENGAGEMENT: 5 },
}));

vi.mock('@/components/ui', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

describe('FeedbackSurvey', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders feedback prompt after delay', async () => {
    render(<FeedbackSurvey />);
    await act(async () => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.getByText(/نظرسنجی/)).toBeDefined();
  });

  it('renders feedback options after delay', async () => {
    render(<FeedbackSurvey />);
    await act(async () => {
      vi.advanceTimersByTime(6000);
    });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
