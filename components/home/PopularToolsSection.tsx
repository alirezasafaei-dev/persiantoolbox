import Link from 'next/link';

const popularTools = [
  {
    path: '/loan',
    title: 'محاسبه اقساط وام',
    desc: 'محاسبه قسط ماهانه و جدول بازپرداخت',
    icon: '💰',
  },
  {
    path: '/salary',
    title: 'محاسبه حقوق ۱۴۰۵',
    desc: 'محاسبه خالص دریافتی با کسورات قانونی',
    icon: '💰',
  },
  {
    path: '/interest',
    title: 'محاسبه سود سپرده',
    desc: 'محاسبه سود سالانه و ماهانه سپرده',
    icon: '💰',
  },
  {
    path: '/date-tools/shamsi-gregorian',
    title: 'تبدیل تاریخ شمسی',
    desc: 'تبدیل آنلاین شمسی به میلادی و بالعکس',
    icon: '📅',
  },
  {
    path: '/pdf-tools/compress/compress-pdf',
    title: 'فشرده‌سازی PDF',
    desc: 'کاهش حجم فایل PDF بدون افت کیفیت',
    icon: '📄',
  },
  {
    path: '/tools/currency-converter',
    title: 'مبدل ارز',
    desc: 'تبدیل ارزهای مختلف با نرخ لحظه‌ای',
    icon: '💰',
  },
];

export default function PopularToolsSection() {
  return (
    <section className="space-y-6" aria-labelledby="popular-heading">
      <div className="flex flex-col gap-2 text-center">
        <h2 id="popular-heading" className="text-2xl font-black text-[var(--text-primary)]">
          محبوب‌ترین ابزارها
        </h2>
        <p className="text-sm text-[var(--text-muted)]">پرکاربردترین ابزارهای جعبه ابزار فارسی</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {popularTools.map((tool) => (
          <Link
            key={tool.path}
            href={tool.path}
            className="group flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-medium)]"
          >
            <span className="text-2xl" aria-hidden="true">
              {tool.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                {tool.title}
              </div>
              <div className="text-xs text-[var(--text-muted)] line-clamp-1">{tool.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
