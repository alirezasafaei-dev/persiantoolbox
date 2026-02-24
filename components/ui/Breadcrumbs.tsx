'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const labelMap: Record<string, string> = {
  tools: 'همه ابزارها',
  'pdf-tools': 'ابزارهای PDF',
  'image-tools': 'ابزارهای تصویر',
  'date-tools': 'ابزارهای تاریخ',
  'text-tools': 'ابزارهای متنی',
  loan: 'محاسبه‌گر وام',
  salary: 'محاسبه‌گر حقوق',
  interest: 'محاسبه‌گر سود بانکی',
  merge: 'ادغام',
  compress: 'فشرده‌سازی',
  convert: 'تبدیل',
  split: 'تقسیم',
  edit: 'ویرایش',
  security: 'امنیت',
  watermark: 'واترمارک',
  paginate: 'شماره‌گذاری',
  extract: 'استخراج',
  'merge-pdf': 'ادغام PDF',
  'compress-pdf': 'فشرده‌سازی PDF',
  'image-to-pdf': 'تبدیل تصویر به PDF',
  'pdf-to-image': 'تبدیل PDF به تصویر',
  'pdf-to-text': 'تبدیل PDF به متن',
  'word-to-pdf': 'تبدیل Word به PDF',
  'split-pdf': 'تقسیم PDF',
  'rotate-pages': 'چرخش صفحات',
  'reorder-pages': 'ترتیب صفحات',
  'delete-pages': 'حذف صفحات',
  'encrypt-pdf': 'رمزگذاری PDF',
  'decrypt-pdf': 'رمزگشایی PDF',
  'add-watermark': 'افزودن واترمارک',
  'add-page-numbers': 'شماره‌گذاری صفحات',
  'extract-pages': 'استخراج صفحات',
  'extract-text': 'استخراج متن',
  'address-fa-to-en': 'آدرس فارسی به انگلیسی',
};

function getLabel(segment: string) {
  return labelMap[segment] ?? segment.replace(/-/g, ' ');
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  if (!pathname) {
    return null;
  }
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length <= 1) {
    return null;
  }

  const crumbs = parts.map((part, index) => ({
    label: getLabel(part),
    href: `/${parts.slice(0, index + 1).join('/')}`,
    isLast: index === parts.length - 1,
  }));

  return (
    <nav aria-label="مسیر صفحه" className="text-xs text-[var(--text-muted)]">
      <ol className="flex flex-wrap items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)]/85 px-3 py-2">
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-2">
            {crumb.isLast ? (
              <span className="rounded-full bg-[rgb(var(--color-primary-rgb)/0.12)] px-2 py-1 font-semibold text-[var(--color-primary)]">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="rounded-full px-2 py-1 transition-colors duration-[var(--motion-fast)] hover:bg-[var(--surface-2)] hover:text-[var(--color-primary)]"
              >
                {crumb.label}
              </Link>
            )}
            {!crumb.isLast ? <span aria-hidden="true">/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
