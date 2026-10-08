import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { aiFeatureEnabled } from '@/lib/ai/quota';
import { buildMetadata } from '@/lib/seo';

const enabled = aiFeatureEnabled();

export const metadata = buildMetadata({
  title: 'ابزارهای هوش مصنوعی فارسی | جعبه ابزار فارسی',
  description:
    'مرکز ابزارهای هوش مصنوعی فارسی، با چت آنلاین و برنامه توسعه قابلیت تولید تصویر. دسترسی رایگان محدود و شفاف.',
  path: '/ai',
  robots: { index: enabled, follow: true },
});

export default function AiHubPage() {
  return (
    <SiteShell containerClassName="py-10 sm:py-16">
      <div dir="rtl" className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-4 text-center">
          <p className="text-sm font-bold text-primary">جعبه ابزار فارسی</p>
          <h1 className="text-3xl font-black leading-relaxed text-(--text-primary) sm:text-5xl">
            هوش مصنوعی فارسی، ساده و در دسترس
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-8 text-(--text-secondary)">
            سؤال‌هایت را فارسی بپرس، برای نوشتن و یادگیری کمک بگیر. این بخش در حال توسعه است و پس از
            آزمایش سرویس رایگان فعال می‌شود.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href="/ai/chat"
            className="group block rounded-3xl border border-(--border-light) bg-(--surface-1) p-7 shadow-subtle transition hover:border-primary"
          >
            <span className="inline-block rounded-full bg-[rgb(var(--color-primary-rgb)/0.1)] px-3 py-1 text-xs font-bold text-primary">
              {enabled ? 'نسخه آزمایشی' : 'در حال آماده‌سازی'}
            </span>
            <h2 className="mt-6 text-2xl font-black text-(--text-primary)">
              گفت‌وگوی هوشمند فارسی
            </h2>
            <p className="mt-3 text-sm leading-8 text-(--text-secondary)">
              برای توضیح موضوعات، ایده‌پردازی و نوشتن متن از دستیار فارسی کمک بگیر.
            </p>
            <span className="mt-6 inline-block text-sm font-bold text-primary group-hover:underline">
              ورود به چت ←
            </span>
          </Link>
          <div className="rounded-3xl border border-dashed border-(--border-light) bg-(--surface-2) p-7">
            <span className="inline-block rounded-full border border-(--border-light) px-3 py-1 text-xs font-bold text-(--text-muted)">
              فاز بعد
            </span>
            <h2 className="mt-6 text-2xl font-black text-(--text-primary)">
              ساخت تصویر با هوش مصنوعی
            </h2>
            <p className="mt-3 text-sm leading-8 text-(--text-secondary)">
              این بخش هنوز فعال نیست. پس از یافتن موتور آنلاین رایگان و آزمایش خروجی واقعی اضافه
              خواهد شد.
            </p>
          </div>
        </div>
        <p className="text-xs leading-7 text-(--text-muted)">
          سرویس‌های هوش مصنوعی ممکن است خطا کنند یا هنگام تکمیل سهمیه رایگان موقتاً پاسخ ندهند.
          پیام‌های چت برای پردازش به ارائه‌دهنده بیرونی ارسال می‌شوند.
        </p>
      </div>
    </SiteShell>
  );
}
