import { getCategories, getCategoryDisplayCount } from '@/lib/tools-registry';

export type CategoryGroupId = 'media' | 'compute' | 'professional';

export type CategoryGroup = {
  id: CategoryGroupId;
  title: string;
  description: string;
};

export type CategoryCatalogEntry = {
  id: string;
  shortName: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
  groupId: CategoryGroupId;
  sortOrder: number;
  popular?: boolean;
  flagship?: boolean;
  topicsPath: string;
};

export const categoryGroups: CategoryGroup[] = [
  {
    id: 'media',
    title: 'فایل و رسانه',
    description: 'ابزارهای PDF، تصویر و پردازش فایل در مرورگر',
  },
  {
    id: 'compute',
    title: 'محاسبه و داده',
    description: 'ابزارهای مالی، تاریخ، متن و اعتبارسنجی',
  },
  {
    id: 'professional',
    title: 'اسناد حرفه‌ای',
    description: 'قرارداد، فاکتور، رزومه و ویرایش نگارش فارسی',
  },
];

const categoryCatalog: Record<string, CategoryCatalogEntry> = {
  'pdf-tools': {
    id: 'pdf-tools',
    shortName: 'PDF',
    tagline: 'فشرده‌سازی، ادغام، تبدیل و تقسیم فایل‌های PDF',
    description: 'ادغام، تقسیم، فشرده‌سازی، تبدیل و امنیت فایل‌های PDF',
    icon: '📄',
    accent: 'from-red-500/20 to-red-500/5',
    groupId: 'media',
    sortOrder: 10,
    popular: true,
    topicsPath: '/topics/pdf-tools',
  },
  'image-tools': {
    id: 'image-tools',
    shortName: 'تصویر',
    tagline: 'فشرده‌سازی، تغییر اندازه و تبدیل فرمت تصاویر',
    description: 'فشرده‌سازی، تغییر اندازه، تبدیل فرمت و OCR تصاویر',
    icon: '🖼️',
    accent: 'from-blue-500/20 to-blue-500/5',
    groupId: 'media',
    sortOrder: 20,
    topicsPath: '/topics/image-tools',
  },
  'finance-tools': {
    id: 'finance-tools',
    shortName: 'مالی',
    tagline: 'محاسبه وام، حقوق، سود بانکی و مالیات',
    description: 'محاسبه حقوق، وام، سود بانکی، مالیات و بیمه',
    icon: '💰',
    accent: 'from-green-500/20 to-green-500/5',
    groupId: 'compute',
    sortOrder: 30,
    popular: true,
    topicsPath: '/topics/finance-tools',
  },
  'date-tools': {
    id: 'date-tools',
    shortName: 'تاریخ',
    tagline: 'تبدیل تاریخ شمسی، میلادی و قمری',
    description: 'تبدیل تاریخ شمسی، میلادی و قمری و محاسبه سن',
    icon: '📅',
    accent: 'from-purple-500/20 to-purple-500/5',
    groupId: 'compute',
    sortOrder: 40,
    topicsPath: '/topics/date-tools',
  },
  'text-tools': {
    id: 'text-tools',
    shortName: 'متنی',
    tagline: 'شمارش کلمات، تبدیل عدد و نرمال‌سازی متن',
    description: 'شمارش کلمات، تبدیل عدد، نرمال‌سازی متن و OCR',
    icon: '✏️',
    accent: 'from-amber-500/20 to-amber-500/5',
    groupId: 'compute',
    sortOrder: 50,
    topicsPath: '/topics/text-tools',
  },
  'validation-tools': {
    id: 'validation-tools',
    shortName: 'اعتبارسنجی',
    tagline: 'تولید QR Code، رمز عبور و اعتبارسنجی کد ملی',
    description: 'تولید QR Code، رمز عبور و اعتبارسنجی کد ملی',
    icon: '🔐',
    accent: 'from-teal-500/20 to-teal-500/5',
    groupId: 'compute',
    sortOrder: 60,
    topicsPath: '/topics/validation-tools',
  },
  'seo-tools': {
    id: 'seo-tools',
    shortName: 'سئو',
    tagline: 'پیش‌نمایش اسنیپت، تحلیل عنوان، تولید اسکیما و بررسی ایندکس‌پذیری',
    description: 'ابزارهای تحلیل و تولید سیگنال‌های سئو به صورت محلی',
    icon: '🔍',
    accent: 'from-emerald-500/20 to-emerald-500/5',
    groupId: 'compute',
    sortOrder: 65,
    topicsPath: '/topics/seo-tools',
  },
  'contract-tools': {
    id: 'contract-tools',
    shortName: 'قرارداد',
    tagline: 'قالب‌های آماده قرارداد اجاره، مبایعه و پیمانکاری',
    description: 'پیش‌نویس قرارداد اجاره، مبایعه، پیمانکاری و خودرو',
    icon: '📝',
    accent: 'from-cyan-500/20 to-cyan-500/5',
    groupId: 'professional',
    sortOrder: 70,
    topicsPath: '/topics/contract-tools',
  },
  'business-tools': {
    id: 'business-tools',
    shortName: 'کسب‌وکار',
    tagline: 'فاکتورساز، رسیدساز و ابزارهای مالی کسب‌وکار',
    description: 'فاکتور فروش، پیش‌فاکتور و رسید دریافت وجه',
    icon: '🧾',
    accent: 'from-violet-500/20 to-violet-500/5',
    groupId: 'professional',
    sortOrder: 80,
    flagship: true,
    topicsPath: '/topics/business-tools',
  },
  'career-tools': {
    id: 'career-tools',
    shortName: 'شغلی',
    tagline: 'رزومه‌ساز حرفه‌ای، گواهی سابقه و قرارداد کار',
    description: 'رزومه فارسی و انگلیسی، گواهی سابقه و قرارداد اشتغال',
    icon: '💼',
    accent: 'from-orange-500/20 to-orange-500/5',
    groupId: 'professional',
    sortOrder: 90,
    flagship: true,
    topicsPath: '/topics/career-tools',
  },
  'writing-tools': {
    id: 'writing-tools',
    shortName: 'نگارش',
    tagline: 'ویرایشگر فارسی، اصلاح نگارش و آمار متن',
    description: 'ویرایشگر فارسی، اصلاح حروف عربی و نیم‌فاصله',
    icon: '✍️',
    accent: 'from-pink-500/20 to-pink-500/5',
    groupId: 'professional',
    sortOrder: 100,
    flagship: true,
    topicsPath: '/topics/writing-tools',
  },
};

export function getCategoryCatalogEntry(categoryId: string): CategoryCatalogEntry | undefined {
  return categoryCatalog[categoryId];
}

export function getCategoryLandingPath(categoryId: string): string {
  const category = getCategories().find((item) => item.id === categoryId);
  return category?.path ?? `/topics/${categoryId}`;
}

export function getCategoryCatalogEntries(): CategoryCatalogEntry[] {
  return getCategories()
    .map((category) => categoryCatalog[category.id])
    .filter((entry): entry is CategoryCatalogEntry => Boolean(entry))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategoriesByGroup(groupId: CategoryGroupId): CategoryCatalogEntry[] {
  return getCategoryCatalogEntries().filter((entry) => entry.groupId === groupId);
}

export function getCategoryGroup(groupId: CategoryGroupId): CategoryGroup | undefined {
  return categoryGroups.find((group) => group.id === groupId);
}

export function getCategoryDisplayLabel(categoryId: string): string {
  return categoryCatalog[categoryId]?.shortName ?? categoryId;
}

export function getCategoryToolCount(categoryId: string): number {
  return getCategoryDisplayCount(categoryId);
}
