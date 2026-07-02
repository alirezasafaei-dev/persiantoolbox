import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

describe('footer UX', () => {
  it('keeps tool categories compact and links to the full topics map', async () => {
    const { default: Footer } = await import('@/components/ui/Footer');

    render(<Footer />);

    expect(screen.getByText('فایل و رسانه')).toBeInTheDocument();
    expect(screen.getByText('محاسبه و داده')).toBeInTheDocument();
    expect(screen.getByText('اسناد و نگارش')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'نقشه کامل همه ابزارها' })).toHaveAttribute(
      'href',
      '/topics',
    );
    expect(screen.queryByText('اعتبارسنجی')).not.toBeInTheDocument();
  });
});

describe('ad slot UX', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('does not show the ad consent prompt before the slot is visible', async () => {
    const { StaticAdSlot } = await import('@/shared/ui/AdSlot');

    render(
      <StaticAdSlot
        slotId="home-test"
        imageUrl="/ads/placeholder-banner.png"
        alt="تبلیغ آزمایشی"
        href="/"
      />,
    );

    expect(screen.queryByText('نمایش تبلیغ غیرشخصی')).not.toBeInTheDocument();
  });

  it('hides the prompt after the user declines ads', async () => {
    const originalObserver = global.IntersectionObserver;
    global.IntersectionObserver = class IntersectionObserver {
      readonly root = null;
      readonly rootMargin = '';
      readonly thresholds = [];

      constructor(callback: IntersectionObserverCallback) {
        callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          this as IntersectionObserver,
        );
      }
      disconnect() {}
      observe() {}
      takeRecords() {
        return [];
      }
      unobserve() {}
    } as unknown as typeof IntersectionObserver;

    const { StaticAdSlot } = await import('@/shared/ui/AdSlot');

    render(
      <StaticAdSlot
        slotId="home-test"
        imageUrl="/ads/placeholder-banner.png"
        alt="تبلیغ آزمایشی"
        href="/"
      />,
    );

    const decline = await screen.findByRole('button', { name: 'نمایش نده' });
    await userEvent.click(decline);

    await waitFor(() => {
      expect(screen.queryByText('نمایش تبلیغ غیرشخصی')).not.toBeInTheDocument();
    });

    global.IntersectionObserver = originalObserver;
  });
});

describe('usage upgrade modal copy', () => {
  it('uses non-contradictory copy when no free uses remain', async () => {
    const { default: UpgradeModal } = await import('@/components/UpgradeModal');

    render(<UpgradeModal isOpen onClose={() => undefined} remainingUses={0} resetTime="فردا" />);

    expect(screen.getByText('سقف استفاده رایگان امروز تمام شده است.')).toBeInTheDocument();
    expect(screen.queryByText(/استفاده رایگان باقی‌مانده دارید/)).not.toBeInTheDocument();
  });
});
