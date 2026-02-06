import { Card } from '@/components/ui';
import SupportCtaButton from '@/components/features/monetization/SupportCtaButton';
import { getSupportLinks } from '@/lib/monetization';
import { IconHeart, IconMoney, IconShield, IconZap } from '@/shared/ui/icons';

const supportOptions = getSupportLinks();

const spendingItems = [
  {
    title: 'بهبود کیفیت و تست',
    description: 'افزایش پوشش تست، بهبود پایداری و تجربه آفلاین.',
    icon: IconShield,
    tone: 'bg-[rgb(var(--color-success-rgb)/0.12)] text-[var(--color-success)]',
  },
  {
    title: 'توسعه ابزارهای جدید',
    description: 'افزودن ابزارهای پرتقاضا برای PDF، متن و تصویر.',
    icon: IconZap,
    tone: 'bg-[rgb(var(--color-info-rgb)/0.12)] text-[var(--color-info)]',
  },
  {
    title: 'هزینه‌های زیرساخت',
    description: 'نگهداری زیرساخت و انتشار نسخه‌های پایدار.',
    icon: IconMoney,
    tone: 'bg-[rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]',
  },
];

export default function SupportPage() {
  return (
    <div className="space-y-10">
      <section className="section-surface p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]"></span>
            حمایت از Persian Tools
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
            کمک کنید تا ابزارها خصوصی و رایگان بمانند
          </h1>
          <p className="text-[var(--text-secondary)] leading-7">
            Persian Tools با تمرکز بر پردازش محلی و حریم خصوصی توسعه یافته است. حمایت شما کمک می‌کند
            این مسیر پایدار بماند، بدون وابستگی به سرویس‌های خارجی یا ردیابی کاربران.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1">
              <IconShield className="h-4 w-4 text-[var(--color-success)]" />
              پردازش محلی
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1">
              <IconHeart className="h-4 w-4 text-[var(--color-danger)]" />
              شفافیت مالی
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1">
              <IconZap className="h-4 w-4 text-[var(--color-info)]" />
              توسعه مستمر
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {supportOptions.map((option) => (
          <Card key={option.title} className="p-5 md:p-6 space-y-4">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full ${option.tone}`}
            >
              <IconHeart className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <div className="text-lg font-black text-[var(--text-primary)]">{option.title}</div>
              <p className="text-sm text-[var(--text-muted)] leading-6">{option.description}</p>
            </div>
            {option.href ? (
              <SupportCtaButton href={option.href} label={option.cta} />
            ) : (
              <div className="text-xs text-[var(--text-muted)]">لینک پرداخت تنظیم نشده است.</div>
            )}
          </Card>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {spendingItems.map((item) => (
          <Card key={item.title} className="p-5 md:p-6">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${item.tone}`}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">{item.title}</div>
                <div className="text-sm text-[var(--text-muted)] leading-6">{item.description}</div>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <Card className="p-6 space-y-3">
        <div className="text-lg font-black text-[var(--text-primary)]">شفافیت و گزارش‌دهی</div>
        <p className="text-sm text-[var(--text-muted)] leading-7">
          گزارش‌های دوره‌ای درباره هزینه‌ها و پیشرفت‌ها در صفحه شفافیت منتشر خواهد شد. هدف ما این
          است که بدانید حمایت شما دقیقاً صرف چه مواردی می‌شود.
        </p>
        <div className="text-xs text-[var(--text-muted)]">
          به‌روزرسانی‌های رسمی از طریق همین صفحه و کانال‌های پروژه اعلام می‌شود.
        </div>
      </Card>
    </div>
  );
}
