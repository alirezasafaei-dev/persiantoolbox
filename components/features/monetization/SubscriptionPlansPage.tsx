import { Card, ButtonLink } from '@/components/ui';
import { IconShield, IconMoney, IconZap, IconHeart } from '@/shared/ui/icons';

const plans = [
  {
    title: 'پلن پایه',
    price: '۴۹٬۰۰۰ تومان / ماه',
    tag: 'محبوب برای شروع',
    features: ['تاریخچه ۳۰ روزه', 'فضای ذخیره ۵۰۰ مگابایت', 'حذف تبلیغات', 'جستجو و فیلتر تاریخچه'],
    tone: 'bg-[rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]',
  },
  {
    title: 'پلن حرفه‌ای',
    price: '۹۹٬۰۰۰ تومان / ماه',
    tag: 'برای کاربران پرتکرار',
    features: [
      'تاریخچه نامحدود',
      'فضای ذخیره ۵ گیگابایت',
      'حذف تبلیغات',
      'دسترسی زودهنگام به قابلیت‌های جدید',
      'اولویت پشتیبانی',
    ],
    tone: 'bg-[rgb(var(--color-success-rgb)/0.12)] text-[var(--color-success)]',
  },
];

const highlights = [
  {
    title: 'ابزارها رایگان می‌مانند',
    description: 'پردازش محلی برای همه فعال است و هیچ ابزاری قفل نمی‌شود.',
    icon: IconShield,
    tone: 'bg-[rgb(var(--color-success-rgb)/0.12)] text-[var(--color-success)]',
  },
  {
    title: 'ارزش واقعی در ازای پرداخت',
    description: 'پرداخت فقط برای تاریخچه و آرشیو کارهاست.',
    icon: IconHeart,
    tone: 'bg-[rgb(var(--color-warning-rgb)/0.12)] text-[var(--color-warning)]',
  },
  {
    title: 'قیمت‌گذاری منعطف',
    description: 'پلن‌ها با توجه به نیازهای مختلف طراحی شده‌اند.',
    icon: IconMoney,
    tone: 'bg-[rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]',
  },
  {
    title: 'رشد پایدار',
    description: 'درآمد اشتراک صرف توسعه ابزارهای جدید می‌شود.',
    icon: IconZap,
    tone: 'bg-[rgb(var(--color-info-rgb)/0.12)] text-[var(--color-info)]',
  },
];

export default function SubscriptionPlansPage() {
  return (
    <div className="space-y-10">
      <section className="section-surface p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]"></span>
            پلن‌های اشتراک تاریخچه
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
            تاریخچه کارها را حرفه‌ای مدیریت کنید
          </h1>
          <p className="text-[var(--text-secondary)] leading-7">
            ابزارها برای همه رایگان هستند. با اشتراک تاریخچه، خروجی‌های قبلی را نگه دارید، از
            تبلیغات خلاص شوید و دسترسی سریع‌تری به کارهای خود داشته باشید.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/support" size="sm">
              حمایت یا اشتراک
            </ButtonLink>
            <ButtonLink href="/account" size="sm" variant="secondary">
              شروع اشتراک
            </ButtonLink>
            <ButtonLink href="/subscription-roadmap" size="sm" variant="secondary">
              نقشه‌راه عمومی اشتراک
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.title} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-black text-[var(--text-primary)]">{plan.title}</div>
                <div className="text-sm text-[var(--text-muted)]">{plan.tag}</div>
              </div>
              <div className={`rounded-full px-3 py-1 text-xs font-semibold ${plan.tone}`}>
                {plan.price}
              </div>
            </div>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <div className="text-xs text-[var(--text-muted)]">
              قیمت‌ها اولیه هستند و پس از دریافت داده‌های واقعی بازبینی می‌شوند.
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {highlights.map((item) => (
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
        <div className="text-lg font-black text-[var(--text-primary)]">پلن سازمانی</div>
        <p className="text-sm text-[var(--text-muted)] leading-7">
          برای سازمان‌ها و تیم‌هایی که حجم استفاده بالاتری دارند، پلن اختصاصی با شرایط و SLA قابل
          مذاکره است.
        </p>
      </Card>
    </div>
  );
}
