import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ButtonLink from '@/shared/ui/ButtonLink';

describe('ButtonLink', () => {
  it('renders with correct href', () => {
    render(<ButtonLink href="/tools">ابزارها</ButtonLink>);
    const link = screen.getByRole('link', { name: 'ابزارها' });
    expect(link).toHaveAttribute('href', '/tools');
  });

  it('applies primary variant class', () => {
    render(
      <ButtonLink href="/test" variant="primary">
        تست
      </ButtonLink>,
    );
    const link = screen.getByRole('link', { name: 'تست' });
    expect(link.className).toContain('btn-primary');
  });

  it('applies size classes', () => {
    render(
      <ButtonLink href="/test" size="lg">
        بزرگ
      </ButtonLink>,
    );
    const link = screen.getByRole('link', { name: 'بزرگ' });
    expect(link.className).toContain('btn-lg');
  });

  it('applies fullWidth class when set', () => {
    render(
      <ButtonLink href="/test" fullWidth>
        تمام عرض
      </ButtonLink>,
    );
    const link = screen.getByRole('link', { name: 'تمام عرض' });
    expect(link.className).toContain('w-full');
  });

  it('applies secondary variant class', () => {
    render(
      <ButtonLink href="/test" variant="secondary">
        ثانویه
      </ButtonLink>,
    );
    const link = screen.getByRole('link', { name: 'ثانویه' });
    expect(link.className).toContain('btn-secondary');
  });
});
