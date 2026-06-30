import type { ReactNode } from 'react';
import Link from 'next/link';
import { getToolsByCategory, getCategoryDisplayCount } from '@/lib/tools-registry';
import { toPersianNumbers } from '@/shared/utils/localization/persian';
import {
  IconPdf,
  IconImage,
  IconMoney,
  IconCalendar,
  IconCalculator,
  IconShield,
} from '@/shared/ui/icons';

function toolShortName(title: string): string {
  const idx = title.indexOf(' - ');
  return idx !== -1 ? title.slice(0, idx) : title;
}

const categoryMeta: Record<
  string,
  {
    name: string;
    path: string;
    accent: string;
    icon: ReactNode;
    tagline: string;
    popular?: boolean;
  }
> = {
  'pdf-tools': {
    name: 'PDF',
    path: '/pdf-tools',
    accent: 'from-red-500/20 to-red-500/5',
    icon: <IconPdf className="w-6 h-6" />,
    tagline: 'فشرده‌سازی، ادغام، تبدیل و تقسیم فایل‌های PDF',
  },
  'image-tools': {
    name: 'تصویر',
    path: '/image-tools',
    accent: 'from-blue-500/20 to-blue-500/5',
    icon: <IconImage className="w-6 h-6" />,
    tagline: 'فشرده‌سازی، تغییر اندازه و تبدیل فرمت تصاویر',
  },
  'finance-tools': {
    name: 'مالی',
    path: '/tools',
    accent: 'from-green-500/20 to-green-500/5',
    icon: <IconMoney className="w-6 h-6" />,
    tagline: 'محاسبه وام، حقوق، سود بانکی و مالیات',
    popular: true,
  },
  'date-tools': {
    name: 'تاریخ',
    path: '/date-tools',
    accent: 'from-purple-500/20 to-purple-500/5',
    icon: <IconCalendar className="w-6 h-6" />,
    tagline: 'تبدیل تاریخ شمسی، میلادی و قمری',
  },
  'text-tools': {
    name: 'متنی',
    path: '/text-tools',
    accent: 'from-amber-500/20 to-amber-500/5',
    icon: <IconCalculator className="w-6 h-6" />,
    tagline: 'شمارش کلمات، تبدیل عدد و نرمال‌سازی متن',
  },
  'validation-tools': {
    name: 'اعتبارسنجی',
    path: '/validation-tools',
    accent: 'from-teal-500/20 to-teal-500/5',
    icon: <IconShield className="w-6 h-6" />,
    tagline: 'تولید QR Code، رمز عبور و اعتبارسنجی کد ملی',
  },
  'contract-tools': {
    name: 'قرارداد',
    path: '/contract-tools',
    accent: 'from-cyan-500/20 to-cyan-500/5',
    tagline: 'قالب‌های آماده قرارداد اجاره، مبایعه و پیمانکاری',
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  'business-tools': {
    name: 'کسب‌وکار',
    path: '/business-tools',
    accent: 'from-violet-500/20 to-violet-500/5',
    tagline: 'فاکتورساز، رسیدساز و ابزارهای مالی کسب‌وکار',
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  'career-tools': {
    name: 'شغلی',
    path: '/career-tools',
    accent: 'from-orange-500/20 to-orange-500/5',
    tagline: 'رزومه‌ساز حرفه‌ای، گواهی سابقه و قرارداد کار',
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </svg>
    ),
  },
  'writing-tools': {
    name: 'نگارش',
    path: '/writing-tools',
    accent: 'from-pink-500/20 to-pink-500/5',
    tagline: 'ویرایشگر فارسی، اصلاح نگارش و آمار متن',
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="M15 5l4 4" />
      </svg>
    ),
  },
};

export function getCategoryMeta() {
  return categoryMeta;
}

function CategoryCardInner({ categoryId }: { categoryId: string }) {
  const meta = categoryMeta[categoryId];
  if (!meta) {
    return null;
  }

  const tools = getToolsByCategory(categoryId);
  const count = getCategoryDisplayCount(categoryId);
  const topTools = tools.slice(0, 4);

  return (
    <div className="group relative flex flex-col rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] transition-all duration-[var(--motion-normal)] hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-medium)]">
      {/* Accent gradient top border */}
      <div
        className={`h-1.5 w-full rounded-t-[var(--radius-lg)] bg-gradient-to-r ${meta.accent}`}
      />

      <div className="flex flex-col gap-3 p-5">
        {/* Header */}
        <Link href={meta.path} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-2)] text-[var(--color-primary)] group-hover:bg-[var(--color-primary)]/10 transition-colors">
            {meta.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                {meta.name}
              </h3>
              {meta.popular ? (
                <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
                  پرجستجو
                </span>
              ) : null}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{meta.tagline}</p>
            <p className="text-[11px] text-[var(--text-muted)]">{toPersianNumbers(count)} ابزار</p>
          </div>
        </Link>

        {/* Top tools list */}
        {topTools.length > 0 && (
          <div className="space-y-1">
            {topTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.path}
                className="flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--color-primary)] transition-colors"
              >
                <span className="h-1 w-1 rounded-full bg-[var(--text-muted)] flex-shrink-0" />
                <span className="truncate">{toolShortName(tool.title)}</span>
              </Link>
            ))}
          </div>
        )}

        {/* See all link */}
        <Link
          href={meta.path}
          className="mt-auto flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline"
        >
          <span>مشاهده همه ابزارها</span>
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

type CategoryCardProps = {
  categoryId: string;
};

export default function CategoryCard({ categoryId }: CategoryCardProps) {
  return <CategoryCardInner categoryId={categoryId} />;
}
