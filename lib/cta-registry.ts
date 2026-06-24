/**
 * Intent-Based CTA Registry
 * Stable placement/offer IDs for cross-site conversion tracking.
 *
 * Placements: WHERE the CTA appears in the UI.
 * Offers: WHAT the CTA offers to the user.
 * Routing: WHICH offer is shown at each placement based on context.
 */

type CtaPlacementId =
  | 'footer-global'
  | 'tool-result-pdf'
  | 'tool-result-image'
  | 'tool-result-finance'
  | 'tool-result-date'
  | 'tool-result-text'
  | 'tool-sidebar'
  | 'premium-gate'
  | 'trust-page'
  | 'privacy-page';

type CtaOfferId =
  | 'portfolio-brand'
  | 'portfolio-consultation'
  | 'portfolio-services'
  | 'audit-free-check'
  | 'toolbox-more-tools';

type CtaDestination = 'portfolio' | 'audit' | 'toolbox';

type CtaPlacement = {
  id: CtaPlacementId;
  label: string;
  description: string;
};

type CtaOffer = {
  id: CtaOfferId;
  destination: CtaDestination;
  emoji: string;
  title: string;
  subtitle: string;
  href: string;
  utmCampaign: string;
  utmMedium: string;
};

type CtaRoute = {
  placement: CtaPlacementId;
  offer: CtaOfferId;
  condition?: string;
};

const placements: Record<CtaPlacementId, CtaPlacement> = {
  'footer-global': {
    id: 'footer-global',
    label: 'فوتر - globally',
    description: 'CTA در فوتر تمام صفحات',
  },
  'tool-result-pdf': {
    id: 'tool-result-pdf',
    label: 'نتیجه ابزار PDF',
    description: 'CTA بعد از نتیجه ابزارهای PDF',
  },
  'tool-result-image': {
    id: 'tool-result-image',
    label: 'نتیجه ابزار تصویر',
    description: 'CTA بعد از نتیجه ابزارهای تصویر',
  },
  'tool-result-finance': {
    id: 'tool-result-finance',
    label: 'نتیجه ابزار مالی',
    description: 'CTA بعد از نتیجه ابزارهای مالی',
  },
  'tool-result-date': {
    id: 'tool-result-date',
    label: 'نتیجه ابزار تاریخ',
    description: 'CTA بعد از نتیجه ابزارهای تاریخ',
  },
  'tool-result-text': {
    id: 'tool-result-text',
    label: 'نتیجه ابزار متنی',
    description: 'CTA بعد از نتیجه ابزارهای متنی',
  },
  'tool-sidebar': {
    id: 'tool-sidebar',
    label: 'سایدبار ابزار',
    description: 'CTA در سایدبار ابزارها',
  },
  'premium-gate': {
    id: 'premium-gate',
    label: 'دروازه پریمیوم',
    description: 'CTA وقتی کاربر به قابلیت پریمیوم نیاز دارد',
  },
  'trust-page': {
    id: 'trust-page',
    label: 'صفحه شفافیت فنی',
    description: 'CTA در صفحه شفافیت فنی',
  },
  'privacy-page': {
    id: 'privacy-page',
    label: 'صفحه حریم خصوصی',
    description: 'CTA در صفحه حریم خصوصی',
  },
};

const offers: Record<CtaOfferId, CtaOffer> = {
  'portfolio-brand': {
    id: 'portfolio-brand',
    destination: 'portfolio',
    emoji: '🔧',
    title: 'ساخته شده توسط علیرضا صفائی',
    subtitle: 'مهندس سیستم‌های وب',
    href: 'https://alirezasafaeisystems.ir',
    utmCampaign: 'cross_site',
    utmMedium: 'footer',
  },
  'portfolio-consultation': {
    id: 'portfolio-consultation',
    destination: 'portfolio',
    emoji: '💡',
    title: 'نیاز به توسعه اختصاصی دارید؟',
    subtitle: 'مشاوره رایگان دریافت کنید',
    href: 'https://alirezasafaeisystems.ir/services',
    utmCampaign: 'conversion',
    utmMedium: 'tool_result',
  },
  'portfolio-services': {
    id: 'portfolio-services',
    destination: 'portfolio',
    emoji: '🚀',
    title: 'خدمات توسعه وب',
    subtitle: 'طراحی، توسعه و استقرار',
    href: 'https://alirezasafaeisystems.ir/services',
    utmCampaign: 'services',
    utmMedium: 'tool_result',
  },
  'audit-free-check': {
    id: 'audit-free-check',
    destination: 'audit',
    emoji: '🔍',
    title: 'ارزیابی رایگان سایت',
    subtitle: 'مشکلات فنی سایتتان را بشناسید',
    href: 'https://audit.alirezasafaeisystems.ir',
    utmCampaign: 'audit',
    utmMedium: 'tool_result',
  },
  'toolbox-more-tools': {
    id: 'toolbox-more-tools',
    destination: 'toolbox',
    emoji: '🛠️',
    title: 'ابزارهای بیشتر',
    subtitle: 'بیش از ۴۶ ابزار رایگان',
    href: 'https://persiantoolbox.ir/tools',
    utmCampaign: 'toolbox',
    utmMedium: 'cross_sell',
  },
};

const defaultRoutes: CtaRoute[] = [
  { placement: 'footer-global', offer: 'portfolio-brand' },
  { placement: 'tool-result-pdf', offer: 'portfolio-consultation' },
  { placement: 'tool-result-image', offer: 'portfolio-consultation' },
  { placement: 'tool-result-finance', offer: 'audit-free-check' },
  { placement: 'tool-result-date', offer: 'portfolio-services' },
  { placement: 'tool-result-text', offer: 'portfolio-services' },
  { placement: 'tool-sidebar', offer: 'portfolio-brand' },
  { placement: 'premium-gate', offer: 'portfolio-consultation' },
  { placement: 'trust-page', offer: 'audit-free-check' },
  { placement: 'privacy-page', offer: 'portfolio-brand' },
];

function buildUtmUrl(offer: CtaOffer, placement: CtaPlacementId): string {
  const url = new URL(offer.href);
  url.searchParams.set('utm_source', 'toolbox');
  url.searchParams.set('utm_medium', offer.utmMedium);
  url.searchParams.set('utm_campaign', offer.utmCampaign);
  url.searchParams.set('utm_content', placement);
  return url.toString();
}

export function getCtaForPlacement(placementId: CtaPlacementId): {
  offer: CtaOffer;
  href: string;
  placement: CtaPlacement;
} | null {
  const route = defaultRoutes.find((r) => r.placement === placementId);
  if (!route) {
    return null;
  }

  const offer = offers[route.offer];
  const placement = placements[placementId];
  if (!offer || !placement) {
    return null;
  }

  return {
    offer,
    href: buildUtmUrl(offer, placementId),
    placement,
  };
}

export function getAllPlacements(): CtaPlacement[] {
  return Object.values(placements);
}

export function getAllOffers(): CtaOffer[] {
  return Object.values(offers);
}

export function getOfferById(id: CtaOfferId): CtaOffer | undefined {
  return offers[id];
}

export function getPlacementById(id: CtaPlacementId): CtaPlacement | undefined {
  return placements[id];
}
