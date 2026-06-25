import type { Metadata } from 'next';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getPublicSiteSettings } from '@/lib/server/siteSettings';
import ContactForm from './ContactForm';

export const metadata: Metadata = buildMetadata({
  title: 'تماس با ما',
  description: 'راه‌های ارتباطی با تیم جعبه ابزار فارسی — ایمیل، تلفن، آدرس و فرم تماس.',
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
          <h1 className="text-3xl font-black text-[var(--text-primary)]">تماس با ما</h1>
          <p className="text-[var(--text-secondary)] leading-7">
            ما همیشه آماده شنیدن نظرات، پیشنهادات و سؤالات شما هستیم.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-2">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">ایمیل</h2>
            <a
              href={`mailto:${settings.contactEmail}`}
              className="text-sm text-[var(--color-primary)] hover:underline"
            >
              {settings.contactEmail}
            </a>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-2">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">تلفن</h2>
            <a
              href={`tel:${settings.contactPhone.replace(/\D/g, '')}`}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)]"
            >
              {settings.contactPhone}
            </a>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-2">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">آدرس</h2>
            <span className="text-sm text-[var(--text-muted)]">{settings.contactAddress}</span>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 space-y-2">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">ساعات پشتیبانی</h2>
            <span className="text-sm text-[var(--text-muted)]">
              شنبه تا پنج‌شنبه، ۹ صبح تا ۶ عصر
            </span>
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
          <h2 className="text-lg font-black text-[var(--text-primary)]">لینک تلگرام</h2>
          <p className="text-sm text-[var(--text-muted)] leading-7">
            برای ارتباط سریع‌تر می‌توانید از کانال تلگرام ما استفاده کنید.
          </p>
          <a
            href="https://t.me/persiantoolbox"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
          >
            @persiantoolbox در تلگرام
          </a>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
          <h2 className="text-lg font-black text-[var(--text-primary)]">فرم تماس</h2>
          <p className="text-sm text-[var(--text-muted)] leading-7">
            پیام شما در مرورگر ذخیره می‌شود و به سرور ارسال نمی‌شود. لطفاً اطلاعات مهم را از طریق
            ایمیل ارسال کنید.
          </p>
          <ContactForm />
        </section>
      </div>
    </SiteShell>
  );
}
