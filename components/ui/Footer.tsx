import Link from 'next/link';
import { getFeatureHref } from '@/lib/features/availability';
import { DEFAULT_SITE_SETTINGS } from '@/lib/siteSettings';
import { getPublicSiteSettings } from '@/lib/server/siteSettings';

const productLinks = [
  { label: 'ابزارهای PDF', href: '/pdf-tools' },
  { label: 'ابزارهای تصویر', href: '/image-tools' },
  { label: 'ابزارهای متنی', href: '/text-tools' },
  { label: 'همه ابزارها', href: '/tools' },
];

const infoLinks = [
  { label: 'برند ASDEV', href: '/asdev' },
  { label: 'درباره ما', href: '/about' },
  { label: 'راهنماها', href: '/guides' },
  { label: 'نحوه کار', href: '/how-it-works' },
  { label: 'حریم خصوصی', href: '/privacy' },
  { label: 'پشتیبانی', href: '/support' },
];

function isExternalUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export default async function Footer() {
  const currentYear = new Intl.NumberFormat('fa-IR').format(new Date().getFullYear());
  let settings = DEFAULT_SITE_SETTINGS;
  try {
    settings = await getPublicSiteSettings();
  } catch {
    settings = DEFAULT_SITE_SETTINGS;
  }
  const developerProfileUrl = settings.portfolioUrl ?? DEFAULT_SITE_SETTINGS.portfolioUrl;
  const supportHref = getFeatureHref('support');

  return (
    <footer className="mt-14 border-t border-[var(--border-light)] bg-[var(--surface-1)]/90 text-right backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-4 py-10 md:px-6 md:py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr_1fr]">
          <section className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
              <span dir="ltr">ASDEV</span>
              <span aria-hidden="true" className="px-1">
                |
              </span>
              <span>پردازش محلی</span>
            </div>
            <h2 className="text-2xl font-black text-[var(--text-primary)]">جعبه ابزار فارسی</h2>
            <p className="text-sm leading-7 text-[var(--text-secondary)]">
              {settings.developerBrandText}
            </p>
            <p className="text-sm font-semibold text-[var(--text-muted)]">
              برند:{' '}
              {developerProfileUrl ? (
                <a
                  href={developerProfileUrl}
                  target={isExternalUrl(developerProfileUrl) ? '_blank' : undefined}
                  rel={isExternalUrl(developerProfileUrl) ? 'noopener noreferrer' : undefined}
                  className="interactive-link !text-[var(--color-primary)] hover:!text-[var(--color-primary-hover)]"
                >
                  <span dir="ltr">ASDEV</span>
                </a>
              ) : (
                <span className="text-[var(--text-primary)]" dir="ltr">
                  ASDEV
                </span>
              )}
            </p>
            <p className="text-sm font-semibold text-[var(--text-muted)]">
              مسئول توسعه:{' '}
              {developerProfileUrl ? (
                <a
                  href={developerProfileUrl}
                  target={isExternalUrl(developerProfileUrl) ? '_blank' : undefined}
                  rel={isExternalUrl(developerProfileUrl) ? 'noopener noreferrer' : undefined}
                  className="interactive-link !text-[var(--color-primary)] hover:!text-[var(--color-primary-hover)]"
                >
                  {settings.developerName}
                </a>
              ) : (
                <span>{settings.developerName}</span>
              )}
            </p>
          </section>

          <nav aria-label="لینک‌های اصلی" className="space-y-3">
            <h3 className="text-sm font-black text-[var(--text-primary)]">محصول</h3>
            <div className="grid gap-2 text-sm">
              {productLinks.map((item) => (
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
                  const href = item.href === '/support' ? supportHref : item.href;
                  if (isExternalUrl(href)) {
                    return (
                      <a
                        key={item.label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
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
            <div className="mt-3 flex flex-wrap gap-2">
              {settings.orderUrl ? (
                <a
                  href={settings.orderUrl}
                  target={isExternalUrl(settings.orderUrl) ? '_blank' : undefined}
                  rel={isExternalUrl(settings.orderUrl) ? 'noopener noreferrer' : undefined}
                  className="btn btn-primary btn-sm"
                >
                  ثبت سفارش
                </a>
              ) : null}
              {settings.portfolioUrl ? (
                <a
                  href={settings.portfolioUrl}
                  target={isExternalUrl(settings.portfolioUrl) ? '_blank' : undefined}
                  rel={isExternalUrl(settings.portfolioUrl) ? 'noopener noreferrer' : undefined}
                  className="btn btn-secondary btn-sm"
                >
                  نمونه‌کارها / سایت شخصی
                </a>
              ) : null}
            </div>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-[var(--border-light)] pt-5 text-xs text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
          <span>© {currentYear} جعبه ابزار فارسی. همه حقوق محفوظ است.</span>
          <span>تمرکز: تجربه فارسی دقیق، سریع و امن در تمام ابزارها</span>
        </div>
      </div>
    </footer>
  );
}
