import { Card, ButtonLink } from '@/components/ui';
import { IconShield, IconHeart, IconZap } from '@/shared/ui/icons';

const principles = [
  {
    title: 'پردازش محلی',
    description: 'ابزارها در مرورگر اجرا می‌شوند و فایل‌ها از دستگاه خارج نمی‌شوند.',
    tone: 'bg-[rgb(var(--color-success-rgb)/0.12)] text-[var(--color-success)]',
    icon: IconShield,
  },
  {
    title: 'شفافیت کامل',
    description: 'هر داده‌ای که ثبت شود به زبان ساده توضیح داده می‌شود.',
    tone: 'bg-[rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]',
    icon: IconHeart,
  },
  {
    title: 'رضایت کاربر',
    description: 'قابلیت تاریخچه و هر نوع ذخیره‌سازی فقط با رضایت صریح فعال است.',
    tone: 'bg-[rgb(var(--color-info-rgb)/0.12)] text-[var(--color-info)]',
    icon: IconZap,
  },
];

const sections = [
  {
    title: 'چه داده‌هایی جمع‌آوری می‌شود؟',
    items: [
      'کاربران مهمان: هیچ فایل یا محتوایی به سرور ارسال نمی‌شود.',
      'کاربران اشتراک‌دار: اطلاعات حساب، وضعیت اشتراک و متادیتای تاریخچه.',
      'در صورت Opt-in: ذخیره خروجی‌ها با لینک‌های زمان‌دار.',
    ],
  },
  {
    title: 'چه داده‌هایی جمع‌آوری نمی‌شود؟',
    items: [
      'محتوای فایل‌ها برای کاربران مهمان.',
      'اطلاعات حساس مالی کاربران (نزد درگاه پرداخت باقی می‌ماند).',
      'تاریخچه مرور کاربر در سایت‌های دیگر.',
    ],
  },
  {
    title: 'اشتراک‌گذاری با طرف‌های ثالث',
    items: [
      'فقط اطلاعات حداقلی مورد نیاز برای پرداخت به درگاه داخلی ارسال می‌شود.',
      'بدون رضایت صریح، هیچ داده‌ای به شبکه‌های تبلیغاتی ارسال نمی‌شود.',
      'هیچ فروش یا واگذاری داده به اشخاص ثالث انجام نمی‌شود.',
    ],
  },
  {
    title: 'نگهداری و حذف داده‌ها',
    items: [
      'داده‌های تاریخچه فقط برای مدت اشتراک نگهداری می‌شود.',
      'پس از پایان اشتراک، داده‌ها طبق سیاست حذف (مثلاً ۳۰ روز مهلت) پاک می‌شوند.',
      'کاربر می‌تواند هر زمان درخواست حذف کامل تاریخچه یا خروجی‌ها را ثبت کند.',
    ],
  },
  {
    title: 'حقوق کاربران',
    items: [
      'حق مشاهده تاریخچه و داده‌های ثبت‌شده.',
      'حق حذف کامل تاریخچه و خروجی‌ها.',
      'حق لغو رضایت تبلیغاتی در هر زمان.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-10">
      <section className="section-surface p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]"></span>
            سیاست حریم خصوصی
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
            داده‌ها فقط با رضایت شما ذخیره می‌شوند
          </h1>
          <p className="text-[var(--text-secondary)] leading-7">
            Persian Tools متعهد است ابزارها را کاملاً محلی اجرا کند. فقط زمانی که شما اشتراک تاریخچه
            را فعال کنید، داده‌های مرتبط با تاریخچه برای ارائه این قابلیت ذخیره می‌شود.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/support" size="sm">
              حمایت مالی
            </ButtonLink>
            <ButtonLink href="/ads" size="sm" variant="secondary">
              شفافیت تبلیغات
            </ButtonLink>
          </div>
        </div>
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

      <section className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title} className="p-5 md:p-6 space-y-3">
            <div className="text-lg font-black text-[var(--text-primary)]">{section.title}</div>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        ))}
      </section>

      <Card className="p-6 space-y-3">
        <div className="text-lg font-black text-[var(--text-primary)]">امنیت و تغییرات</div>
        <p className="text-sm text-[var(--text-muted)] leading-7">
          دسترسی‌ها مبتنی بر نقش است، ارتباطات با HTTPS انجام می‌شود و لاگ‌های امنیتی برای عملیات
          حساس ثبت می‌شوند. در صورت تغییر این سیاست، نسخه جدید اعلام خواهد شد.
        </p>
      </Card>
    </div>
  );
}
