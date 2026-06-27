/**
 * Single source of truth for all navigation routes.
 * Import from here instead of hardcoding route lists in components.
 */

export type NavRole = 'discover' | 'category' | 'tool' | 'learn' | 'trust' | 'account';

export interface NavItem {
  label: string;
  href: string;
  role: NavRole;
  icon?: string;
}

export const categoryNavItems: NavItem[] = [
  { label: 'ابزارهای PDF', href: '/pdf-tools', role: 'category', icon: 'pdf' },
  { label: 'ابزارهای تصویر', href: '/image-tools', role: 'category', icon: 'image' },
  { label: 'ابزارهای مالی', href: '/tools', role: 'category', icon: 'calculator' },
  { label: 'ابزارهای تاریخ', href: '/date-tools', role: 'category', icon: 'calendar' },
  { label: 'ابزارهای متنی', href: '/text-tools', role: 'category', icon: 'zap' },
  { label: 'ابزارهای اعتبارسنجی', href: '/validation-tools', role: 'category', icon: 'lock' },
  { label: 'ابزارهای قرارداد', href: '/contract-tools', role: 'category', icon: 'file' },
  { label: 'ابزارهای کسب‌وکار', href: '/business-tools', role: 'category', icon: 'briefcase' },
  { label: 'ابزارهای شغلی', href: '/career-tools', role: 'category', icon: 'briefcase' },
  { label: 'ابزارهای نگارش فارسی', href: '/writing-tools', role: 'category', icon: 'pencil' },
];

export const mainNavItems: NavItem[] = [
  ...categoryNavItems,
  { label: 'موضوعات', href: '/topics', role: 'discover' },
  { label: 'جستجو', href: '/search', role: 'discover' },
  { label: 'بلاگ', href: '/blog', role: 'learn' },
  { label: 'راهنماها', href: '/guides', role: 'learn' },
  { label: 'نحوه کار', href: '/how-it-works', role: 'learn' },
  { label: 'حریم خصوصی', href: '/privacy', role: 'trust' },
  { label: 'قوانین', href: '/terms', role: 'trust' },
  { label: 'درباره ما', href: '/about', role: 'trust' },
  { label: 'پشتیبانی', href: '/support', role: 'trust' },
];

export interface NavDropdownGroup {
  label: string;
  items: NavItem[];
}

export interface NavDropdown {
  label: string;
  groups: NavDropdownGroup[];
}

export const flagshipProducts: NavItem[] = [
  { label: 'فاکتورساز و رسیدساز', href: '/business-tools/document-studio', role: 'tool' },
  { label: 'رزومه‌ساز حرفه‌ای', href: '/career-tools/resume-builder', role: 'tool' },
  { label: 'ویرایشگر فارسی', href: '/writing-tools/persian-writing-studio', role: 'tool' },
];

export const utilityGroups: NavDropdownGroup[] = [
  {
    label: 'ابزارهای فایل و محتوا',
    items: [
      { label: 'PDF', href: '/pdf-tools', role: 'category' },
      { label: 'تصویر', href: '/image-tools', role: 'category' },
      { label: 'متنی', href: '/text-tools', role: 'category' },
    ],
  },
  {
    label: 'ابزارهای محاسباتی',
    items: [
      { label: 'مالی', href: '/tools', role: 'category' },
      { label: 'تاریخ', href: '/date-tools', role: 'category' },
      { label: 'اعتبارسنجی', href: '/validation-tools', role: 'category' },
    ],
  },
  {
    label: 'قراردادها',
    items: [{ label: 'قرارداد', href: '/contract-tools', role: 'category' }],
  },
];

export const utilityDropdown: NavDropdown = {
  label: 'ابزارها',
  groups: utilityGroups,
};

export const flagshipDropdown: NavDropdown = {
  label: 'محصولات حرفه‌ای',
  groups: [
    {
      label: 'محصولات',
      items: flagshipProducts,
    },
  ],
};

export const footerCategoryLinks = categoryNavItems.map(({ label, href }) => ({ label, href }));

export const footerPageLinks = [
  { label: 'همه ابزارها', href: '/topics' },
  { label: 'جستجوی ابزارها', href: '/search' },
  { label: 'قیمت‌گذاری', href: '/pricing' },
  { label: 'بلاگ', href: '/blog' },
  { label: 'راهنمای ابزارها', href: '/guides' },
  { label: 'نحوه کار', href: '/how-it-works' },
  { label: 'API', href: '/developers/api' },
];

export const footerTrustLinks = [
  { label: 'حریم خصوصی', href: '/privacy' },
  { label: 'شفافیت فنی', href: '/trust' },
  { label: 'قوانین', href: '/terms' },
  { label: 'درباره ما', href: '/about' },
  { label: 'پشتیبانی', href: '/support' },
];
