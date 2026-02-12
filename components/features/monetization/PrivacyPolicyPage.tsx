import { Card } from '@/components/ui';
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
    description: 'هرگونه نمایش تبلیغات فقط با رضایت صریح کاربر انجام می‌شود.',
    tone: 'bg-[rgb(var(--color-info-rgb)/0.12)] text-[var(--color-info)]',
    icon: IconZap,
  },
];

const sections = [
  {
    title: 'چه داده‌هایی جمع‌آوری می‌شود؟',
    items: [
      'ابزارها در حالت پیش‌فرض بدون ثبت‌نام و بدون حساب کاربری قابل استفاده هستند.',
      'هیچ فایل یا محتوای پردازش‌شده از ابزارها به سرور ارسال نمی‌شود.',
      'در صورت رضایت تبلیغاتی، فقط سیگنال‌های حداقلی مرتبط با نمایش تبلیغ ثبت می‌شود.',
    ],
  },
  {
    title: 'چه داده‌هایی جمع‌آوری نمی‌شود؟',
    items: [
      'محتوای فایل‌ها و خروجی ابزارها.',
      'اطلاعات حساب کاربری، چون ورود/ثبت‌نام در نسخه ۱.۱.۱ غیرفعال است.',
      'تاریخچه مرور کاربر در سایت‌های دیگر.',
    ],
  },
  {
    title: 'اشتراک‌گذاری با طرف‌های ثالث',
    items: [
      'بدون رضایت صریح، هیچ داده‌ای برای نمایش تبلیغ ارسال نمی‌شود.',
      'هیچ فروش یا واگذاری داده به اشخاص ثالث انجام نمی‌شود.',
    ],
  },
  {
    title: 'نگهداری و حذف داده‌ها',
    items: [
      'داده‌های پردازش ابزارها در مرورگر می‌مانند و سمت سرور ذخیره نمی‌شوند.',
      'در صورت ثبت رخدادهای حداقلی تبلیغاتی، داده‌ها بدون محتوای فایل نگهداری می‌شوند.',
      'در به‌روزرسانی‌های بعدی، چرخه نگهداری داده‌ها شفاف اعلام می‌شود.',
    ],
  },
  {
    title: 'حقوق کاربران',
    items: [
      'حق استفاده از ابزارها بدون ایجاد حساب کاربری.',
      'حق لغو رضایت تبلیغاتی در هر زمان.',
      'حق درخواست توقف پردازش داده‌های تحلیلی حداقلی.',
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
            Persian Tools متعهد است ابزارها را کاملاً محلی اجرا کند. در نسخه ۱.۱.۱ ورود، ثبت‌نام و
            قابلیت‌های اشتراکی غیرفعال شده‌اند و تمرکز محصول روی ابزارهای رایگان و تبلیغات رضایتی
            است.
          </p>
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
