import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TextToolsPage from '@/components/features/text-tools/TextToolsPage';

vi.mock('@/shared/ui/toast-context', () => ({
  useToast: () => ({
    showToast: vi.fn(),
    recordCopy: vi.fn(),
  }),
}));

vi.mock('@/shared/history/recordHistory', () => ({
  recordHistory: vi.fn(),
}));

vi.mock('@/components/features/history/RecentHistoryCard', () => ({
  default: () => <div data-testid="recent-history-card" />,
}));

describe('TextToolsPage AsyncState errors', () => {
  it('does not render legacy date converter controls', () => {
    render(<TextToolsPage />);

    expect(screen.queryByText('تبدیل تاریخ')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: 'تاریخ شمسی (YYYY/MM/DD)' }),
    ).not.toBeInTheDocument();
  });

  it('shows number validation error via AsyncState on invalid number', async () => {
    const user = userEvent.setup();
    render(<TextToolsPage />);

    const numberInput = screen.getByRole('textbox', { name: 'عدد' });
    await user.clear(numberInput);
    await user.type(numberInput, 'abc');

    await user.click(screen.getByRole('button', { name: 'تبدیل' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('لطفاً عدد معتبر وارد کنید.');
  });
});
