import Link from 'next/link';

const toolCategoryLinks = [
  { label: 'ابزارهای پی دی اف', href: '/pdf-tools' },
  { label: 'ابزارهای تصویر', href: '/image-tools' },
  { label: 'ابزارهای مالی', href: '/loan' },
  { label: 'ابزارهای تاریخ', href: '/date-tools' },
  { label: 'ابزارهای متنی', href: '/text-tools' },
];

const toolboxLinks = [
  { label: 'ابزارهای تخصصی', href: '/tools/specialized' },
  { label: 'راهنمای ابزارها', href: '/guides' },
  { label: 'همه ابزارها', href: '/topics' },
  { label: 'نحوه کار', href: '/how-it-works' },
  { label: 'صفحه اصلی', href: '/' },
];

const infoLinks = [
  { label: 'تیم طراحی و توسعه', href: '/asdev' },
  { label: 'حریم خصوصی', href: '/privacy' },
  { label: 'پشتیبانی', href: 'mailto:alirezasafaeisystems@gmail.com' },
  { label: 'قوانین', href: '/terms' },
  { label: 'معرفی به دوستان', href: '/refer' },
];

function isExternalUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export default function Footer() {
  return (
    <footer className="mt-14 border-t border-[var(--border-light)] bg-[var(--surface-1)]/90 text-right backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-4 py-10 md:px-6 md:py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <nav aria-label="دسته بندی ابزارها" className="space-y-3">
            <h3 className="text-sm font-black text-[var(--text-primary)]">دسته بندی ابزارها</h3>
            <div className="grid gap-2 text-sm">
              {toolCategoryLinks.map((item) => (
                <Link key={item.href} href={item.href} className="interactive-link inline-flex">
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <nav aria-label="جعبه ابزار فارسی" className="space-y-3">
            <h3 className="text-sm font-black text-[var(--text-primary)]">جعبه ابزار فارسی</h3>
            <div className="grid gap-2 text-sm">
              {toolboxLinks.map((item) => (
                <Link key={item.href} href={item.href} className="interactive-link inline-flex">
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <nav aria-label="اطلاعات و ارتباط" className="space-y-3">
            <h3 className="text-sm font-black text-[var(--text-primary)]">اطلاعات و ارتباط</h3>
            <div className="grid gap-2 text-sm">
              {infoLinks.map((item) =>
                (() => {
                  const href = item.href;
                  if (isExternalUrl(href) || href.startsWith('mailto:')) {
                    return (
                      <a
                        key={item.label}
                        href={href}
                        target={isExternalUrl(href) ? '_blank' : undefined}
                        rel={isExternalUrl(href) ? 'noopener noreferrer' : undefined}
                        className="interactive-link inline-flex"
                      >
                        {item.label}
                      </a>
                    );
                  }
                  return (
                    <Link key={item.href} href={href} className="interactive-link inline-flex">
                      {item.label}
                    </Link>
                  );
                })(),
              )}
            </div>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-[var(--border-light)] pt-5 text-xs text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
          <span>© ۲۰۲۶ جعبه ابزار فارسی. همه حقوق محفوظ است.</span>
          <span>
            طراحی و توسعه توسط{' '}
            <a
              href="https://alirezasafaeisystems.ir/"
              target="_blank"
              rel="noopener noreferrer"
              className="interactive-link"
            >
              علیرضا صفایی مهندس سیستم های وب
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
