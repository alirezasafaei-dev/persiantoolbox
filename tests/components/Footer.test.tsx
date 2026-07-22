import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <span data-alt={alt} data-src={src} {...props} />
  ),
}));

vi.mock('@/shared/cross-site/PortfolioCTA', () => ({
  PortfolioCTA: () => <div data-testid="portfolio-cta" />,
}));

vi.mock('@/components/ui/EnamadSeal', () => ({
  default: () => <div data-testid="enamad-seal" />,
}));

vi.mock('@/components/ui/FooterDynamic', () => ({
  default: () => <div data-testid="footer-dynamic" />,
}));

vi.mock('@/lib/home-copy', () => ({
  getFooterBrandCopy: () => ({
    title: 'جعبه ابزار فارسی',
    tagline: 'ابزارهای رایگان',
    description: 'ابزار آنلاین فارسی',
  }),
}));

vi.mock('@/lib/siteSettings', () => ({
  DEFAULT_SITE_SETTINGS: {
    companyName: 'تست',
    contactAddress: 'آدرس',
    contactPhone: '۰۲۱۱۲۳۴۵۶۷۸',
    contactEmail: 'test@test.com',
  },
}));

describe('Footer', () => {
  it('renders copyright text', async () => {
    const { default: Footer } = await import('@/components/ui/Footer');
    render(<Footer />);
    expect(screen.getAllByText(/جعبه ابزار فارسی/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders tool category groups', async () => {
    const { default: Footer } = await import('@/components/ui/Footer');
    render(<Footer />);
    expect(screen.getByText(/فایل و رسانه/)).toBeDefined();
  });

  it('renders social links', async () => {
    const { default: Footer } = await import('@/components/ui/Footer');
    render(<Footer />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(5);
  });
});
