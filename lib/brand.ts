export const BRAND = {
  siteName: 'جعبه ابزار فارسی',
  tagline: 'ابزارهای آنلاین فارسی، سریع و امن',
  baseUrl: 'https://persiantoolbox.ir',
  masterBrand: 'ASDEV',
  ownerName: 'علیرضا صفایی',
  ownerSiteUrl: 'https://alirezasafaeisystems.ir/',
  supportEmail: 'alirezasafaeisystems@gmail.com',
  phone: '۰۲۱-۹۱۰۳۵۳۹۸',
  address: 'کرمانشاه، خیابان ۲۲ بهمن',
  telegramUrl: 'https://t.me/persiantoolbox',
  repository: {
    owner: 'parsairaniiidev',
    name: 'persiantoolbox',
  },
} as const;

export function getDefaultSiteUrl(): string {
  const envSiteUrl = process.env['NEXT_PUBLIC_SITE_URL']?.trim();
  if (envSiteUrl && envSiteUrl.length > 0) {
    if (process.env['NODE_ENV'] === 'production' && envSiteUrl.includes('localhost')) {
      throw new Error(
        `[brand.ts] CRITICAL: NEXT_PUBLIC_SITE_URL is "${
          envSiteUrl
        }" but NODE_ENV is "production". ` +
          'Set NEXT_PUBLIC_SITE_URL to https://persiantoolbox.ir in your build environment.',
      );
    }
    return envSiteUrl;
  }
  if (process.env['NODE_ENV'] === 'development') {
    return 'http://localhost:3000';
  }
  return BRAND.baseUrl;
}
