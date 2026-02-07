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
  it('shows calendar error via AsyncState on invalid date format', async () => {
    const user = userEvent.setup();
    render(<TextToolsPage />);

    const calendarInput = screen.getByRole('textbox', { name: 'تاریخ شمسی (YYYY/MM/DD)' });
    await user.clear(calendarInput);
    await user.type(calendarInput, 'abc');

    const convertButtons = screen.getAllByRole('button', { name: 'تبدیل' });
    const dateConvertButton = convertButtons.at(0);
    if (!dateConvertButton) {
      throw new Error('date convert button not found');
    }
    await user.click(dateConvertButton);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'فرمت تاریخ باید به صورت سال/ماه/روز باشد.',
    );
  });

  it('shows number validation error via AsyncState on invalid number', async () => {
    const user = userEvent.setup();
    render(<TextToolsPage />);

    const numberInput = screen.getByRole('textbox', { name: 'عدد' });
    await user.clear(numberInput);
    await user.type(numberInput, 'abc');

    const convertButtons = screen.getAllByRole('button', { name: 'تبدیل' });
    const numberConvertButton = convertButtons.at(1);
    if (!numberConvertButton) {
      throw new Error('number convert button not found');
    }
    await user.click(numberConvertButton);

    expect(await screen.findByRole('alert')).toHaveTextContent('لطفاً عدد معتبر وارد کنید.');
  });
});
