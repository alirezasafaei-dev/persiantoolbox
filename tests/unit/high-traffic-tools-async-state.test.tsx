import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DateToolsPage from '@/components/features/date-tools/DateToolsPage';
import LoanPage from '@/components/features/loan/LoanPage';
import SalaryPage from '@/components/features/salary/SalaryPage';

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

describe('High-traffic tools AsyncState regressions', () => {
  it('shows AsyncState error in loan page for invalid principal input', async () => {
    const user = userEvent.setup();
    render(<LoanPage />);

    const principalInput = screen.getByRole('textbox', { name: /مبلغ وام/ });
    await user.clear(principalInput);
    await user.type(principalInput, 'abc');

    await user.click(screen.getByRole('button', { name: 'محاسبه کن' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('خطا در محاسبه');
  });

  it('shows AsyncState error in salary page for invalid net salary input', async () => {
    const user = userEvent.setup();
    render(<SalaryPage />);

    await user.click(screen.getByRole('button', { name: /حقوق خالص به ناخالص/ }));
    const netSalaryInput = screen.getByRole('textbox', { name: 'حقوق خالص (تومان)' });
    await user.clear(netSalaryInput);
    await user.type(netSalaryInput, 'abc');

    await user.click(screen.getByRole('button', { name: 'محاسبه مجدد' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('خطا در محاسبه');
  });

  it('shows AsyncState error in date-tools for invalid date format', async () => {
    const user = userEvent.setup();
    render(<DateToolsPage />);

    const convertDateInput = screen.getByRole('textbox', { name: 'تاریخ ورودی (YYYY/MM/DD)' });
    await user.clear(convertDateInput);
    await user.type(convertDateInput, 'abc');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('فرمت تاریخ باید به صورت سال/ماه/روز باشد.');
  });
});
