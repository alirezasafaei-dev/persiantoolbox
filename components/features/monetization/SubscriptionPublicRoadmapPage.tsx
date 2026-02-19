import { Card, ButtonLink } from '@/components/ui';
import { getFeatureHref } from '@/lib/features/availability';
import { IconCalendar, IconShield, IconZap } from '@/shared/ui/icons';

const roadmapSections = [
  {
    title: 'اکنون (Now)',
    description: 'تمرکز بر MVP تاریخچه و امنیت داده‌ها',
    items: [
      'شروع توسعه تاریخچه کارها برای کاربران اشتراک‌دار',
      'تمرکز بر امنیت، حریم خصوصی و حذف خودکار داده‌ها',
      'آماده‌سازی پلن‌های پایه و حرفه‌ای',
    ],
  },
  {
    title: 'بعدی (Next)',
    description: 'تجربه کاربری روان و دسترسی سریع',
    items: [
      'داشبورد تاریخچه با جستجو و فیلتر پیشرفته',
      'لینک‌های امن و زمان‌دار برای خروجی‌ها',
      'حذف تبلیغات برای مشترکان',
      'مسیر ارتقا پلن در یک کلیک',
    ],
  },
  {
    title: 'بعدتر (Later)',
    description: 'قابلیت‌های پیشرفته برای کاربران حرفه‌ای',
    items: [
      'تاریخچه چند دستگاهی با سینک سریع',
      'صادرات تاریخچه به فرمت‌های استاندارد',
      'اطلاع‌رسانی هوشمند درباره اتمام پلن/حجم',
      'قابلیت‌های انحصاری برای مشترکان حرفه‌ای',
    ],
  },
];

const principles = [
  {
    title: 'ابزارهای رایگان برای همه',
    description: 'پردازش محلی همیشه فعال است و هیچ ابزار اصلی قفل نمی‌شود.',
    icon: IconShield,
    tone: 'bg-[rgb(var(--color-success-rgb)/0.12)] text-[var(--color-success)]',
  },
  {
    title: 'شفافیت در مسیر توسعه',
    description: 'پیشرفت‌ها و تغییرات مهم با کاربران به اشتراک گذاشته می‌شود.',
    icon: IconCalendar,
    tone: 'bg-[rgb(var(--color-warning-rgb)/0.12)] text-[var(--color-warning)]',
  },
  {
    title: 'رشد پایدار',
    description: 'درآمد اشتراک صرف توسعه قابلیت‌های کاربردی و امن می‌شود.',
    icon: IconZap,
    tone: 'bg-[rgb(var(--color-info-rgb)/0.12)] text-[var(--color-info)]',
  },
];

export default function SubscriptionPublicRoadmapPage() {
  const plansHref = getFeatureHref('plans');
  const supportHref = getFeatureHref('support');

  return (
    <div className="space-y-10">
      <section className="section-surface p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]"></span>
            نقشه‌راه عمومی اشتراک
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
            مسیر توسعه قابلیت‌های اشتراکی
          </h1>
          <p className="text-[var(--text-secondary)] leading-7">
            این نقشه‌راه برای اطلاع‌رسانی به کاربران تهیه شده است و ممکن است با توجه به بازخوردها
            به‌روزرسانی شود.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={plansHref} size="sm">
              پلن‌های اشتراک
            </ButtonLink>
            <ButtonLink href={supportHref} size="sm" variant="secondary">
              حمایت مالی
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {roadmapSections.map((section) => (
          <Card key={section.title} className="p-5 md:p-6 space-y-3">
            <div className="text-lg font-black text-[var(--text-primary)]">{section.title}</div>
            <div className="text-xs text-[var(--text-muted)]">{section.description}</div>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {principles.map((item) => (
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
    </div>
  );
}
