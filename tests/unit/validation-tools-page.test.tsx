import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ValidationToolsPage from '@/components/features/validation-tools/ValidationToolsPage';

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

describe('ValidationToolsPage interactions', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn(() => true),
    });
  });

  it('toggles national id visibility mode', async () => {
    const user = userEvent.setup();
    render(<ValidationToolsPage />);

    const input = screen.getByRole('textbox', { name: 'کد ملی ۱۰ رقمی' });
    expect(input).toHaveAttribute('type', 'text');

    const card = input.closest('.card');
    if (!(card instanceof HTMLElement)) {
      throw new Error('national id card not found');
    }
    const toggle = within(card).getByRole('button', { name: 'مخفی' });
    await user.click(toggle);

    const passwordInput = screen.getByLabelText('کد ملی ۱۰ رقمی');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(within(card).getByRole('button', { name: 'نمایش' })).toBeInTheDocument();
  });

  it('copies normalized national id value', async () => {
    const user = userEvent.setup();
    render(<ValidationToolsPage />);

    const input = screen.getByRole('textbox', { name: 'کد ملی ۱۰ رقمی' });
    await user.type(input, '0010350829');

    const card = input.closest('.card');
    if (!(card instanceof HTMLElement)) {
      throw new Error('national id card not found');
    }
    const copyButton = within(card).getByRole('button', { name: 'کپی مقدار' });
    await user.click(copyButton);

    expect(within(card).getByRole('button', { name: 'کپی شد' })).toBeInTheDocument();
  });

  it('shows invalid badge for malformed mobile number', async () => {
    const user = userEvent.setup();
    render(<ValidationToolsPage />);

    const mobileInput = screen.getByRole('textbox', { name: 'موبایل ایران' });
    await user.type(mobileInput, '0912');

    expect(await screen.findByText('نامعتبر')).toBeInTheDocument();
  });
});
