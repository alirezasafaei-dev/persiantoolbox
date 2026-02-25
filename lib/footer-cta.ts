export type FooterCtaSettings = {
  orderUrl?: string | null;
  portfolioUrl?: string | null;
};

export type FooterCtaLink = {
  id: 'order' | 'portfolio';
  href: string;
  label: string;
};

export function getFooterCtaLinks(settings: FooterCtaSettings): FooterCtaLink[] {
  const links: FooterCtaLink[] = [];

  if (settings.orderUrl) {
    links.push({
      id: 'order',
      href: settings.orderUrl,
      label: 'ثبت سفارش',
    });
  }

  if (settings.portfolioUrl) {
    links.push({
      id: 'portfolio',
      href: settings.portfolioUrl,
      label: 'نمونه‌کارها / سایت شخصی',
    });
  }

  return links;
}
