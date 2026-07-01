import Link from 'next/link';
import type { ReactNode } from 'react';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';
import { DEFAULT_SITE_SETTINGS } from '@/lib/siteSettings';
import {
  categoryGroups,
  getCategoriesByGroup,
  getCategoryLandingPath,
} from '@/lib/category-catalog';
import { getFooterBrandCopy } from '@/lib/home-copy';
import { footerPageLinks, footerTrustLinks } from '@/lib/navigation';
import { IconLock, IconShield, IconZap } from '@/shared/ui/icons';
import EnamadSeal from './EnamadSeal';
import FooterDynamic from './FooterDynamic';

const popularTools = [
  { label: 'همه ابزارهای رایگان', href: '/topics' },
  { label: 'فاکتورساز و رسیدساز', href: '/business-tools/document-studio' },
  { label: 'رزومه‌ساز حرفه‌ای', href: '/career-tools/resume-builder' },
  { label: 'ویرایشگر فارسی', href: '/writing-tools/persian-writing-studio' },
  { label: 'محاسبه وام', href: '/loan' },
  { label: 'فشرده‌سازی PDF', href: '/pdf-tools/compress/compress-pdf' },
];

const trustSignals: Array<{ icon: ReactNode; text: string }> = [
  {
    icon: <IconLock className="h-4 w-4 shrink-0 text-[var(--color-success)]" />,
    text: 'ابزارهای پایه رایگان',
  },
  {
    icon: <IconZap className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />,
    text: 'شروع فوری بدون ثبت‌نام',
  },
  {
    icon: <IconShield className="h-4 w-4 shrink-0 text-[var(--color-info)]" />,
    text: 'پردازش محلی و حریم خصوصی',
  },
];

export default function Footer() {
  const settings = DEFAULT_SITE_SETTINGS;
  const brand = getFooterBrandCopy();

  return (
    <footer className="mt-14 border-t border-[var(--border-light)] bg-[var(--surface-1)]/90 text-right backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-4 py-10 md:px-6 md:py-12 lg:px-8">
        <div className="mb-8 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-2)] p-5">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h2 className="text-lg font-black text-[var(--text-primary)]">
                ابزار آنلاین فارسی رایگان برای کارهای روزمره
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                محاسبه، تبدیل، ساخت سند، ویرایش PDF و متن فارسی؛ بدون نصب برنامه و بدون ثبت‌نام.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {trustSignals.map((item) => (
                <span
                  key={item.text}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]"
                >
                  {item.icon}
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          <div className="space-y-3 lg:col-span-1">
            <h3 className="text-base font-black text-[var(--text-primary)]">{brand.title}</h3>
            <p className="text-sm font-semibold text-[var(--color-primary)]">{brand.tagline}</p>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">{brand.description}</p>
            <Link
              href="/topics"
              className="inline-flex rounded-full bg-[rgb(var(--color-primary-rgb)/0.1)] px-3 py-1.5 text-sm font-bold text-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.16)]"
            >
              شروع رایگان با ابزارها ←
            </Link>
          </div>

          <nav aria-label="دسته بندی ابزارها" className="space-y-4 lg:col-span-1">
            <h3 className="text-sm font-black text-[var(--text-primary)]">
              دسته‌بندی ابزارهای رایگان
            </h3>
            <div className="space-y-4">
              {categoryGroups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <div className="text-xs font-bold text-[var(--text-muted)]">{group.title}</div>
                  <div className="grid grid-cols-1 gap-1.5 text-sm">
                    {getCategoriesByGroup(group.id).map((entry) => (
                      <Link
                        key={entry.id}
                        href={getCategoryLandingPath(entry.id)}
                        className="interactive-link inline-flex"
                      >
                        {entry.shortName}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          <nav aria-label="صفحات سایت" className="space-y-3 lg:col-span-1">
            <h3 className="text-sm font-black text-[var(--text-primary)]">کاوش سایت</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {footerPageLinks.map((item) => (
                <Link key={item.href} href={item.href} className="interactive-link inline-flex">
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <nav aria-label="سایر لینک‌ها" className="space-y-3 lg:col-span-1">
            <h3 className="text-sm font-black text-[var(--text-primary)]">اعتماد و پشتیبانی</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {footerTrustLinks.map((item) => (
                <Link key={item.href} href={item.href} className="interactive-link inline-flex">
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div className="mt-8">
          <nav aria-label="ابزارهای محبوب" className="space-y-3">
            <h3 className="text-sm font-black text-[var(--text-primary)]">
              شروع سریع با ابزارهای رایگان
            </h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {popularTools.map((item) => (
                <Link key={item.href} href={item.href} className="interactive-link inline-flex">
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <FooterDynamic />

        <div className="mt-8">
          <PortfolioCTA variant="footer" />
        </div>

        <div className="mt-8 flex justify-center">
          <EnamadSeal />
        </div>

        <div className="mt-8 space-y-4 border-t border-[var(--border-light)] pt-5">
          <div className="space-y-1 text-xs text-[var(--text-muted)]">
            <p>برند: {settings.companyName}</p>
            <p>آدرس: {settings.contactAddress}</p>
            <p>
              تلفن:{' '}
              <a
                href={`tel:${settings.contactPhone.replace(/\D/g, '')}`}
                className="hover:underline"
              >
                {settings.contactPhone}
              </a>
            </p>
            <p>
              ایمیل:{' '}
              <a href={`mailto:${settings.contactEmail}`} className="hover:underline">
                {settings.contactEmail}
              </a>
            </p>
            <p>
              <Link href="/contact" className="hover:underline">
                صفحه تماس با ما
              </Link>
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 text-center text-xs text-[var(--text-muted)]">
            <span>ساخته شده با ❤️ در ایران — آخرین به‌روزرسانی: تیر ۱۴۰۵</span>
            <span>© ۲۰۲۶ جعبه ابزار فارسی. همه حقوق محفوظ است.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
