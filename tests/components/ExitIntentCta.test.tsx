import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExitIntentCta from '@/components/features/pricing/ExitIntentCta';

describe('ExitIntentCta', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not show initially', () => {
    render(<ExitIntentCta />);
    expect(screen.queryByText(/پیشنهاد ویژه/)).toBeNull();
  });

  it('shows on mouseleave', () => {
    render(<ExitIntentCta />);
    fireEvent.mouseLeave(document, { clientY: 0 });
    expect(screen.getByText(/پیشنهاد ویژه/)).toBeDefined();
  });

  it('hides on close button click', () => {
    render(<ExitIntentCta />);
    fireEvent.mouseLeave(document, { clientY: 0 });
    const closeButton = screen.getByRole('button', { name: /بستن/ });
    fireEvent.click(closeButton);
    expect(screen.queryByText(/پیشنهاد ویژه/)).toBeNull();
  });

  it('hides on escape key', () => {
    render(<ExitIntentCta />);
    fireEvent.mouseLeave(document, { clientY: 0 });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText(/پیشنهاد ویژه/)).toBeNull();
  });

  it('links to pricing page', () => {
    render(<ExitIntentCta />);
    fireEvent.mouseLeave(document, { clientY: 0 });
    const link = screen.getByRole('link', { name: /مشاهده طرح‌های اشتراک/ });
    expect(link).toHaveAttribute('href', '/pricing');
  });
});
