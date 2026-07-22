import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UpgradeModal from '@/components/UpgradeModal';

vi.mock('@/lib/subscriptionPlans', () => ({
  SUBSCRIPTION_PLANS: [
    { id: 'basic', name: 'پایه', price: 99000 },
    { id: 'pro', name: 'حرفه‌ای', price: 199000 },
  ],
}));

describe('UpgradeModal', () => {
  it('renders when open', () => {
    render(<UpgradeModal isOpen onClose={vi.fn()} remainingUses={3} resetTime="فردا" />);
    expect(screen.getByRole('dialog', { name: /ارتقای حساب/ })).toBeDefined();
  });

  it('does not render when closed', () => {
    render(<UpgradeModal isOpen={false} onClose={vi.fn()} remainingUses={3} resetTime="فردا" />);
    expect(screen.queryByText(/ارتقا/)).toBeNull();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<UpgradeModal isOpen onClose={onClose} remainingUses={3} resetTime="فردا" />);
    fireEvent.click(screen.getByRole('button', { name: /بستن/ }));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders upgrade buttons', () => {
    render(<UpgradeModal isOpen onClose={vi.fn()} remainingUses={3} resetTime="فردا" />);
    expect(screen.getByText(/ارتقا به پایه/)).toBeDefined();
    expect(screen.getByText(/ارتقا به حرفه‌ای/)).toBeDefined();
  });
});
