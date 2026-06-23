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
  { label: 'راهنمای ابزارها', href: '/guides' },
  { label: 'نحوه کار', href: '/how-it-works' },
  { label: 'توسعه‌دهندگان', href: '/developers' },
  { label: 'حریم خصوصی', href: '/privacy' },
  { label: 'شفافیت فنی', href: '/trust' },
  { label: 'قوانین', href: '/terms' },
  { label: 'درباره ما', href: '/about' },
  { label: 'پشتیبانی', href: '/support' },
  { label: 'معرفی به دوستان', href: '/refer' },
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
              "<a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=747528&Code=FoqexOpavF6DTKEaYNaVlvGZ1sYeU5vv'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=747528&Code=FoqexOpavF6DTKEaYNaVlvGZ1sYeU5vv' alt='نماد اعتماد الکترونیکی enamad' style='cursor:pointer' code='FoqexOpavF6DTKEaYNaVlvGZ1sYeU5vv'></a>",
          }}
        />

        <div className="mt-8 flex justify-center border-t border-[var(--border-light)] pt-5">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-4">
              <a
                href="https://t.me/persiantoolbox"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-muted)] transition hover:text-[var(--color-primary)]"
                aria-label="تلگرام"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
              </a>
              <Link href="/blog" className="text-[var(--text-muted)] transition hover:text-[var(--color-primary)]" aria-label="بلاگ">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </Link>
            </div>
            <span className="text-xs text-[var(--text-muted)]">© ۲۰۲۶ جعبه ابزار فارسی. همه حقوق محفوظ است.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
