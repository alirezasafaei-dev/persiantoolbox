import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import { guidePages } from '@/lib/guide-pages';

export const metadata = buildMetadata({
  title: 'راهنماهای کاربردی ابزارها - جعبه ابزار فارسی',
  description:
    'راهنماهای مرحله‌به‌مرحله برای استفاده بهتر از ابزارهای مالی، PDF، تاریخ و حریم خصوصی با رویکرد محلی-اول.',
  path: '/guides',
  keywords: [
    'راهنمای ابزارهای فارسی',
    'آموزش ابزار آنلاین فارسی',
    'راهنمای وام و حقوق',
    'راهنمای PDF',
    'راهنمای حریم خصوصی',
  ],
});

export default function GuidesPage() {
  return (
    <SiteShell containerClassName="py-10">
      <section className="space-y-3">
        <p className="inline-flex items-center rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
          راهنمای عملی
        </p>
        <h1 className="text-3xl font-black text-[var(--text-primary)]">مرکز راهنماها</h1>
        <p className="max-w-3xl text-sm text-[var(--text-secondary)]">
          این صفحه مجموعه راهنماهای کاربردی برای استفاده دقیق‌تر از ابزارها را ارائه می‌کند. هر
          راهنما شامل مسیر اجرا، نکات خطایابی و سوالات متداول است.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {guidePages.map((guide) => (
          <article
            key={guide.slug}
            className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-subtle)] transition-all duration-[var(--motion-fast)] hover:border-[var(--border-strong)]"
          >
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              <Link href={`/guides/${guide.slug}`} className="focus-ring rounded-sm">
                {guide.title}
              </Link>
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{guide.summary}</p>
            <div className="mt-4">
              <Link
                href={`/guides/${guide.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
              >
                مطالعه راهنما
                <span aria-hidden="true">←</span>
              </Link>
            </div>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
