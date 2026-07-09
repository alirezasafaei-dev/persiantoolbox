const patterns = [
  {
    icon: '💰',
    category: 'ابزارهای مالی',
    categoryEn: 'financial-tools',
    headline: 'محاسبه حقوق و مالیات',
    description:
      'پرتکرارترین بازگشت کاربران برای محاسبه خالص حقوق، مالیات بر درآمد و اقساط وام مسکن. بیشتر بازدیدها در ۵ روز اول ماه میلادی متمرکز است.',
    metric: '۳ برابر بیشتر در ابتدای ماه',
    metricLabel: 'افزایش بازدید',
    color: 'var(--color-financial)',
    bg: 'var(--color-primary-50)',
  },
  {
    icon: '📄',
    category: 'PDF و فایل',
    categoryEn: 'pdf-tools',
    headline: 'فشرده‌سازی و ادغام PDF',
    description:
      'کاربران معمولاً بلافاصله پس از دریافت ایمیل یا تلگرام به PDF ابزار برمی‌گردند. بزرگ‌ترین فایل‌ها معمولاً رزومه و گزارش مالی هستند.',
    metric: 'بیش از ۶۰٪ زیر ۲MB',
    metricLabel: 'حجم فایل‌ها',
    color: 'var(--color-document)',
    bg: 'var(--color-primary-50)',
  },
  {
    icon: '✏️',
    category: 'متن و ویرایش',
    categoryEn: 'text-tools',
    headline: 'ویرایش متن فارسی',
    description:
      'بیشترین درخواست‌ها: تبدیل عربی به فارسی، اصلاح فاصله‌گذاری و نیم‌فاصله. بسیاری از کاربران متن را از ورد کپی و مستقیماً ویرایش می‌کنند.',
    metric: '۱۲ ثانیه میانگین زمان استفاده',
    metricLabel: 'سرعت ویرایش',
    color: 'var(--color-utility)',
    bg: 'var(--color-primary-50)',
  },
  {
    icon: '📋',
    category: 'قراردادها',
    categoryEn: 'contract-tools',
    headline: 'پیش‌نویس قرارداد',
    description:
      'پرتکرارترین الگو: کپی متن قرارداد از تلگرام → پر کردن فیلدها → خروجی PDF. کاربران معمولاً ۲–۳ بار ذخیره و بازگشت می‌کنند.',
    metric: '۲–۳ بار ذخیره در هر نشست',
    metricLabel: 'تعداد ذخیره',
    color: 'var(--color-success)',
    bg: 'var(--color-primary-50)',
  },
  {
    icon: '📑',
    category: 'رزومه و شغل',
    categoryEn: 'career-tools',
    headline: 'ساخت رزومه',
    description:
      'بیشترین ترافیک از شبکه‌های اجتماعی می‌آید. کاربران اغلب رزومه را چندین بار ویرایش و دوباره خروجی می‌گیرند — الگوی بازگشت بالا.',
    metric: '۳–۵ بازگشت در هفته اول',
    metricLabel: 'ویرایش مجدد',
    color: 'var(--color-image)',
    bg: 'var(--color-primary-50)',
  },
  {
    icon: '📝',
    category: 'فاکتور و رسید',
    categoryEn: 'business-tools',
    headline: 'صدور فاکتور',
    description:
      'پرتکرارترین فیلدها: شماره فاکتور، تاریخ و مبلغ. بیشتر کاربران فاکتور را مستقیماً از طریق لینک مشترک ارسال می‌کنند.',
    metric: '۸۰٪+ از مرورگر موبایل',
    metricLabel: 'ترافیک موبایل',
    color: 'var(--color-success)',
    bg: 'var(--color-primary-50)',
  },
];

export default function TestimonialsSection() {
  return (
    <section
      className="space-y-8"
      aria-labelledby="testimonials-heading"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <h2
          id="testimonials-heading"
          className="text-2xl font-black text-[var(--text-primary)] sm:text-3xl"
        >
          کاربران بیشتر برای چه کارهایی برمی‌گردند؟
        </h2>
        <p className="max-w-xl text-sm leading-7 text-[var(--text-muted)]">
          این بخش بر اساس الگوهای واقعی استفاده از ابزارهاست — نه نقل‌قول‌های
          فردی. اعداد و رفتارها از آمار بازدید و تعامل کاربران استخراج شده‌اند.
        </p>
      </div>

      <div
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="الگوهای پرتکرار استفاده کاربران"
      >
        {patterns.map((item) => (
          <div
            key={item.categoryEn}
            role="listitem"
            className="group relative flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-subtle)] transition-all duration-[var(--motion-medium)] hover:-translate-y-0.5 hover:border-[var(--border-medium)] hover:shadow-[var(--shadow-medium)]"
          >
            {/* Accent top bar */}
            <div
              className="absolute inset-x-0 top-0 h-1 rounded-t-[var(--radius-lg)]"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />

            {/* Header */}
            <div className="flex items-start gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-lg"
                style={{ backgroundColor: item.bg }}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <div className="space-y-0.5">
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: item.color }}
                >
                  {item.category}
                </span>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {item.headline}
                </h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm leading-7 text-[var(--text-secondary)]">
              {item.description}
            </p>

            {/* Metric badge */}
            <div className="mt-auto flex items-center gap-2 border-t border-[var(--border-light)] pt-3">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold"
                style={{ backgroundColor: item.bg, color: item.color }}
                aria-label={`${item.metricLabel}: ${item.metric}`}
              >
                {item.metric}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {item.metricLabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-[var(--text-muted)]">
        داده‌ها بر اساس آمار بازدید و تعامل کاربران جمع‌آوری شده‌اند و به‌صورت
        دوره‌ای به‌روزرسانی می‌شوند.
      </p>
    </section>
  );
}
