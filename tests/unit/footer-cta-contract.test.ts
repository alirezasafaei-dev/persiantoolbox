import { describe, expect, it } from 'vitest';
import { getFooterCtaLinks } from '@/lib/footer-cta';

describe('footer CTA links contract', () => {
  it('keeps CTA labels and order deterministic', () => {
    const links = getFooterCtaLinks({
      orderUrl: 'https://example.com/order',
      portfolioUrl: 'https://example.com/portfolio',
    });

    expect(links).toEqual([
      {
        id: 'order',
        href: 'https://example.com/order',
        label: 'ثبت سفارش',
      },
      {
        id: 'portfolio',
        href: 'https://example.com/portfolio',
        label: 'نمونه‌کارها / سایت شخصی',
      },
    ]);
  });

  it('omits empty CTA links', () => {
    expect(
      getFooterCtaLinks({
        orderUrl: null,
        portfolioUrl: '',
      }),
    ).toEqual([]);
  });
});
