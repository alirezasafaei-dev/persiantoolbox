import Link from 'next/link';
import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

const categoryLinks = [
  { label: 'ابزارهای PDF', href: '/pdf-tools' },
  { label: 'ابزارهای تصویر', href: '/image-tools' },
  { label: 'ابزارهای مالی', href: '/tools' },
  { label: 'ابزارهای تاریخ', href: '/date-tools' },
  { label: 'ابزارهای متنی', href: '/text-tools' },
  { label: 'ابزارهای اعتبارسنجی', href: '/validation-tools' },
];

const pageLinks = [
  { label: 'همه ابزارها', href: '/topics' },
  { label: 'جستجوی ابزارها', href: '/search' },
  { label: 'راهنمای ابzarها', href: '/guides' },
  { label: 'حریم خصوصی', href: '/privacy' },
  { label: 'شفافیت فنی', href: '/trust' },
  { label: 'قوانین', href: '/terms' },
  { label: 'تیم طراحی و توسعه', href: '/asdev' },
];

export default function Footer() {
  return (
    <footer className="mt-14 border-t border-[var(--border-light)] bg-[var(--surface-1)]/90 text-right backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-4 py-10 md:px-6 md:py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <nav aria-label="دسته بندی ابزارها" className="space-y-3">
            <h3 className="text-sm font-black text-[var(--text-primary)]">ابزارها</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {categoryLinks.map((item) => (
                <Link key={item.href} href={item.href} className="interactive-link inline-flex">
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <nav aria-label="صفحات سایت" className="space-y-3">
            <h3 className="text-sm font-black text-[var(--text-primary)]">صفحات سایت</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {pageLinks.map((item) => (
                <Link key={item.href} href={item.href} className="interactive-link inline-flex">
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div className="mt-8">
          <PortfolioCTA variant="footer" />
        </div>

        {/* Enamad Trust Seal — exact HTML from Enamad panel, do not modify */}
        <div
          className="mt-8 flex justify-center"
          dangerouslySetInnerHTML={{
            __html:
              "<a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=747528&Code=FoqexOpavF6DTKEaYNaVlvGZ1sYeU5vv'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=747528&Code=FoqexOpavF6DTKEaYNaVlvGZ1sYeU5vv' alt='' style='cursor:pointer' code='FoqexOpavF6DTKEaYNaVlvGZ1sYeU5vv'></a>",
          }}
        />

        <div className="mt-8 flex justify-center border-t border-[var(--border-light)] pt-5 text-xs text-[var(--text-muted)]">
          <span>© ۲۰۲۶ جعبه ابزار فارسی. همه حقوق محفوظ است.</span>
        </div>
      </div>
    </footer>
  );
}
