import type { Metadata } from 'next';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getPublicSiteSettings } from '@/lib/server/siteSettings';

export const metadata: Metadata = buildMetadata({
  title: 'تماس با ما',
  description: 'راه‌های ارتباطی با تیم جعبه ابزار فارسی — ایمیل، تلفن، آدرس و تلگرام.',
  path: '/contact',
  keywords: ['تماس با ما', 'پشتیبانی', 'ارتباط با ما', 'جعبه ابزار فارسی'],
});

export default async function ContactPage() {
  const settings = await getPublicSiteSettings();
  return (
    <SiteShell containerClassName="py-10">
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'تماس با ما', url: `${siteUrl}/contact` },
        ]}
      />
      <div className="mx-auto max-w-3xl space-y-10">
        <section className="space-y-2">
          <h1 className="text-3xl font-black text-(--text-primary)">تماس با ما</h1>
          <p className="text-(--text-secondary) leading-7">
            ما همیشه آماده شنیدن نظرات، پیشنهادات و سؤالات شما هستیم.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-(--border-light) bg-(--surface-1) p-5 space-y-2">
            <h2 className="text-sm font-bold text-(--text-primary)">ایمیل</h2>
            <a
              href={`mailto:${settings.contactEmail}`}
              className="text-sm text-primary hover:underline"
            >
              {settings.contactEmail}
            </a>
          </div>

          <div className="rounded-lg border border-(--border-light) bg-(--surface-1) p-5 space-y-2">
            <h2 className="text-sm font-bold text-(--text-primary)">تلفن</h2>
            <a
              href={`tel:${settings.contactPhone.replace(/\D/g, '')}`}
              className="text-sm text-(--text-muted) hover:text-primary"
            >
              {settings.contactPhone}
            </a>
          </div>

          <div className="rounded-lg border border-(--border-light) bg-(--surface-1) p-5 space-y-2">
            <h2 className="text-sm font-bold text-(--text-primary)">آدرس</h2>
            <span className="text-sm text-(--text-muted)">{settings.contactAddress}</span>
          </div>

          <div className="rounded-lg border border-(--border-light) bg-(--surface-1) p-5 space-y-2">
            <h2 className="text-sm font-bold text-(--text-primary)">ساعات پشتیبانی</h2>
            <span className="text-sm text-(--text-muted)">شنبه تا پنج‌شنبه، ۹ صبح تا ۶ عصر</span>
          </div>
        </section>

        <section className="rounded-lg border border-(--border-light) bg-(--surface-1) p-6 space-y-4">
          <h2 className="text-lg font-black text-(--text-primary)">ارتباط مستقیم</h2>
          <p className="text-sm text-(--text-muted) leading-7">
            برای ارتباط سریع‌تر از راه‌های زیر استفاده کنید:
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://t.me/persiantoolbox"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-(--text-inverted) hover:opacity-90 transition-opacity"
            >
              تلگرام — @persiantoolbox
            </a>
            <a
              href={`mailto:${settings.contactEmail}`}
              className="inline-flex items-center gap-2 rounded-md border border-(--border-light) bg-(--surface-1) px-5 py-2.5 text-sm font-semibold text-(--text-primary) hover:border-primary transition-colors"
            >
              ایمیل
            </a>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
