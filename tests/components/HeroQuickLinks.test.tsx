import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeroQuickLinks from '@/components/home/HeroQuickLinks';

describe('HeroQuickLinks', () => {
  it('renders quick access links', () => {
    render(<HeroQuickLinks />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('renders search-intent links', () => {
    render(<HeroQuickLinks />);
    expect(screen.getByText(/محاسبه وام/)).toBeDefined();
  });
});
