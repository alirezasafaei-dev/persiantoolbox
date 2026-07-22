import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UpgradePrompt from '@/components/features/pricing/UpgradePrompt';

describe('UpgradePrompt', () => {
  it('renders upgrade message', () => {
    render(<UpgradePrompt />);
    expect(screen.getByText(/ارتقا دهید/)).toBeDefined();
  });

  it('renders upgrade link', () => {
    render(<UpgradePrompt />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/pricing');
  });

  it('renders upgrade button text', () => {
    render(<UpgradePrompt />);
    expect(screen.getByRole('link', { name: /ارتقا/ })).toBeDefined();
  });
});
