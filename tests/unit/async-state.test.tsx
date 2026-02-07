import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AsyncState from '@/shared/ui/AsyncState';

describe('AsyncState', () => {
  it('renders loading state with polite status region', () => {
    render(<AsyncState variant="loading" description="در حال دریافت اطلاعات" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('در حال بارگذاری')).toBeInTheDocument();
  });

  it('renders error state as assertive alert', () => {
    render(<AsyncState variant="error" description="خطا رخ داد" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('خطا رخ داد')).toBeInTheDocument();
  });

  it('runs action callback when action button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <AsyncState
        variant="error"
        description="خطا رخ داد"
        action={{ label: 'تلاش مجدد', onClick }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'تلاش مجدد' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
