export const BRAND = {
  siteName: 'جعبه ابزار فارسی',
  tagline: 'ابزارهای آنلاین فارسی، سریع و امن',
  baseUrl: 'https://persiantoolbox.ir',
  repository: {
    owner: 'alirezasafaeiiidev',
    name: 'persiantoolbox',
  },
} as const;

export function getDefaultSiteUrl(): string {
  const envSiteUrl = process.env['NEXT_PUBLIC_SITE_URL']?.trim();
  if (envSiteUrl && envSiteUrl.length > 0) {
    return envSiteUrl;
  }
  if (process.env['NODE_ENV'] === 'development') {
    return 'http://localhost:3000';
  }
  return BRAND.baseUrl;
}
