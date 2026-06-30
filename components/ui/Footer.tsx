import Link from 'next/link';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';
import { DEFAULT_SITE_SETTINGS } from '@/lib/siteSettings';
import { footerCategoryLinks, footerPageLinks, footerTrustLinks } from '@/lib/navigation';
import EnamadSeal from './EnamadSeal';
import FooterDynamic from './FooterDynamic';

const popularTools = [
  { label: 'فاکتورساز و رسیدساز', href: '/business-tools/document-studio' },
  { label: 'رزومه‌ساز حرفه‌ای', href: '/career-tools/resume-builder' },
  { label: 'ویرایشگر فارسی', href: '/writing-tools/persian-writing-studio' },
  { label: 'قرارداد اجاره', href: '/contract-tools/rental-contract' },
];

const trustSignals = [
  { icon: '🔒', text: 'پردازش محلی — فایل‌ها ارسال نمی‌شوند' },
  { icon: '⚡', text: 'سریع و رایگان — بدون ثبت‌نام' },
  { icon: '🛡️', text: 'حریم خصوصی شما حفظ می‌شود' },
];

export default function Footer() {
  const settings = DEFAULT_SITE_SETTINGS;
  return (
    <footer className="mt-14 border-t border-[var(--border-light)] bg-[var(--surface-1)]/90 text-right backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-4 py-10 md:px-6 md:py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <nav aria-label="دسته بندی ابزارها" className="space-y-3">
            <h3 className="text-sm font-black text-[var(--text-primary)]">ابزارها</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {footerCategoryLinks.map((item) => (
                <Link key={item.href} href={item.href} className="interactive-link inline-flex">
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <nav aria-label="صفحات سایت" className="space-y-3">
            <h3 className="text-sm font-black text-[var(--text-primary)]">صفحات سایت</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {footerPageLinks.map((item) => (
                <Link key={item.href} href={item.href} className="interactive-link inline-flex">
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <nav aria-label="سایر لینک‌ها" className="space-y-3">
            <h3 className="text-sm font-black text-[var(--text-primary)]">اطلاعات بیشتر</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {footerTrustLinks.map((item) => (
                <Link key={item.href} href={item.href} className="interactive-link inline-flex">
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-2)] p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {trustSignals.map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <nav aria-label="ابزارهای محبوب" className="space-y-3">
            <h3 className="text-sm font-black text-[var(--text-primary)]">ابزارهای محبوب</h3>
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

        <div className="mt-8 border-t border-[var(--border-light)] pt-5 space-y-4">
          <div className="text-xs text-[var(--text-muted)] space-y-1">
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
          <div className="flex flex-col items-center gap-2 text-xs text-[var(--text-muted)]">
            <span>ساخته شده با ❤️ در ایران — آخرین به‌روزرسانی: تیر ۱۴۰۵</span>
            <span>© ۲۰۲۶ جعبه ابزار فارسی. همه حقوق محفوظ است.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
