import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import ChatWorkspace from '@/components/ai/ChatWorkspace';
import { aiFeatureEnabled } from '@/lib/ai/quota';
import { buildMetadata } from '@/lib/seo';

const enabled = aiFeatureEnabled();

export const metadata = buildMetadata({
  title: 'چت هوش مصنوعی فارسی رایگان | جعبه ابزار فارسی',
  description: 'دستیار گفت‌وگوی فارسی برای پرسش‌وپاسخ، توضیح موضوعات و کمک به نوشتن؛ بدون نصب برنامه. ظرفیت استفاده رایگان محدود است.',
  path: '/ai/chat',
  keywords: ['چت هوش مصنوعی فارسی', 'چت بات فارسی', 'چت آنلاین هوش مصنوعی'],
  robots: { index: enabled, follow: true },
});

export default function AiChatPage() {
  return (
    <SiteShell containerClassName="py-8 sm:py-12">
      <div className="mx-auto max-w-5xl space-y-8" dir="rtl">
        <nav aria-label="مسیر صفحه" className="text-xs text-(--text-muted)">
          <Link href="/" className="hover:text-primary">خانه</Link>
          <span aria-hidden className="mx-2">/</span>
          <Link href="/ai" className="hover:text-primary">هوش مصنوعی</Link>
          <span aria-hidden className="mx-2">/</span>
          چت فارسی
        </nav>
        <div className="space-y-3">
          <span className="inline-flex rounded-full border border-(--border-light) bg-(--surface-2) px-4 py-1.5 text-xs font-semibold text-(--text-secondary)">
            {enabled ? 'نسخه آزمایشی رایگان' : 'در حال آماده‌سازی'}
          </span>
          <h1 className="text-3xl font-black leading-relaxed text-(--text-primary) sm:text-4xl">چت هوش مصنوعی فارسی</h1>
          <p className="max-w-3xl text-sm leading-8 text-(--text-secondary)">
            با دستیار فارسی سؤال بپرس، ایده بگیر و متن بنویس. برای شروع نیازی به نصب برنامه نیست.
            پاسخ‌ها ممکن است اشتباه باشند و بهتر است اطلاعات مهم را بررسی کنی.
          </p>
        </div>
        <ChatWorkspace enabled={enabled} />
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-(--border-light) bg-(--surface-1) p-5">
            <h2 className="font-bold text-(--text-primary)">آیا استفاده رایگان است؟</h2>
            <p className="mt-2 text-sm leading-7 text-(--text-secondary)">
              این قابلیت بعد از راه‌اندازی، با تعداد پیام محدود رایگان ارائه می‌شود.
              در زمان تکمیل سهمیه روزانه یا شلوغی سرویس، ممکن است پاسخ‌گویی موقتاً متوقف شود.
            </p>
          </div>
          <div className="rounded-2xl border border-(--border-light) bg-(--surface-1) p-5">
            <h2 className="font-bold text-(--text-primary)">پیام‌ها کجا پردازش می‌شوند؟</h2>
            <p className="mt-2 text-sm leading-7 text-(--text-secondary)">
              برخلاف ابزارهای محلی سایت، پیام چت برای تولید پاسخ به سرویس هوش مصنوعی ابری ارسال می‌شود.
              از ارسال رمز، اطلاعات بانکی و متن‌های حساس خودداری کن.
            </p>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
