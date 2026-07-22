import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewsletterSignup from '@/components/home/NewsletterSignup';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('NewsletterSignup', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders newsletter form', () => {
    render(<NewsletterSignup />);
    expect(screen.getByText(/خبرنامه/)).toBeDefined();
    expect(screen.getByRole('textbox')).toBeDefined();
  });

  it('renders subscribe button', () => {
    render(<NewsletterSignup />);
    expect(screen.getByRole('button', { name: /عضویت/ })).toBeDefined();
  });

  it('has email input field', () => {
    render(<NewsletterSignup />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });
});
