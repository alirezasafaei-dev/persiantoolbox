import Link from 'next/link';
import type { ComponentType } from 'react';
import { IconMoney, IconCalendar, IconPdf } from '@/shared/ui/icons';

type IconComponent = ComponentType<{ className?: string }>;

const popularTools: Array<{
  path: string;
  title: string;
  desc: string;
  icon: IconComponent;
}> = [
  {
    path: '/loan',
    title: 'محاسبه اقساط وام',
    desc: 'محاسبه قسط ماهانه و جدول بازپرداخت',
    icon: IconMoney,
  },
  {
    path: '/salary',
    title: 'محاسبه حقوق ۱۴۰۵',
    desc: 'محاسبه خالص دریافتی با کسورات قانونی',
    icon: IconMoney,
  },
  {
    path: '/interest',
    title: 'محاسبه سود سپرده',
    desc: 'محاسبه سود سالانه و ماهانه سپرده',
    icon: IconMoney,
  },
  {
    path: '/date-tools/shamsi-gregorian',
    title: 'تبدیل تاریخ شمسی',
    desc: 'تبدیل آنلاین شمسی به میلادی و بالعکس',
    icon: IconCalendar,
  },
  {
    path: '/pdf-tools/compress/compress-pdf',
    title: 'فشرده‌سازی PDF',
    desc: 'کاهش حجم فایل PDF بدون افت کیفیت',
    icon: IconPdf,
  },
  {
    path: '/tools/currency-converter',
    title: 'مبدل ارز',
    desc: 'تبدیل ارزهای مختلف با نرخ لحظه‌ای',
    icon: IconMoney,
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
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]"
              aria-hidden="true"
            >
              <tool.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--color-primary)]">
                {tool.title}
              </div>
              <div className="line-clamp-1 text-xs text-[var(--text-muted)]">{tool.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
