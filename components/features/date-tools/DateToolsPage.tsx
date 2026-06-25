'use client';

import Link from 'next/link';
import { Card } from '@/components/ui';
import PageHero from '@/shared/ui/PageHero';

const dateTools = [
  {
    id: 'shamsi-gregorian',
    title: 'تبدیل تاریخ شمسی و میلادی',
    description: 'تبدیل آنی تاریخ شمسی به میلادی و بالعکس',
    icon: '📅',
    path: '/date-tools/shamsi-gregorian',
  },
  {
    id: 'date-difference',
    title: 'محاسبه اختلاف تاریخ',
    description: 'محاسبه روز، هفته، ماه و سال بین دو تاریخ میلادی',
    icon: '📊',
    path: '/date-tools/date-difference',
  },
  {
    id: 'age-calculator',
    title: 'محاسبه سن',
    description: 'محاسبه دقیق سن بر اساس تاریخ تولد شمسی یا میلادی',
    icon: '🎂',
    path: '/date-tools/age-calculator',
  },
  {
    id: 'weekday-finder',
    title: 'روز هفته',
    description: 'پیدا کردن روز هفته هر تاریخ شمسی یا میلادی',
    icon: '📆',
    path: '/date-tools/weekday-finder',
  },
  {
    id: 'persian-calendar',
    title: 'تقویم فارسی',
    description: 'تقویم فارسی (هجری خورشیدی) با نمایش ماه‌ها و روزها',
    icon: '🗓️',
    path: '/date-tools/persian-calendar',
  },
  {
    id: 'holiday-checker',
    title: 'بررسی تعطیلات رسمی',
    description: 'بررسی تعطیلات رسمی ایران در تقویم شمسی و قمری',
    icon: '🎌',
    path: '/date-tools/holiday-checker',
  },
  {
    id: 'event-reminder',
    title: 'یادآوری رویدادها',
    description: 'ثبت و مدیریت رویدادهای مهم با یادآوری',
    icon: '🔔',
    path: '/date-tools/event-reminder',
  },
];

export default function DateToolsPage() {
  return (
    <div className="space-y-10">
      <PageHero
        title="ابزارهای تاریخ"
        description="تبدیل تاریخ شمسی/میلادی/قمری، محاسبه سن، فاصله تاریخ و روز هفته با ورودی ساختاریافته."
        gradient="warning"
        badges={[{ text: 'ابزارهای تاریخ - کاملاً آفلاین', color: 'info' }]}
      />

      <Card className="p-6">
        <p className="text-sm text-[var(--text-muted)]">
          ابزار مورد نظر خود را انتخاب کنید و مستقیم وارد شوید.
        </p>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {dateTools.map((tool) => (
          <Card
            key={tool.id}
            className="group transition-all duration-[var(--motion-medium)] hover:shadow-[var(--shadow-strong)] hover:-translate-y-1"
          >
            <Link
              href={tool.path}
              className="block p-6 text-center"
              aria-label={`شروع ${tool.title}`}
            >
              <div className="text-4xl mb-4 transition-transform duration-[var(--motion-fast)] group-hover:scale-110">
                {tool.icon}
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-lg font-bold transition-colors duration-[var(--motion-fast)] text-[var(--text-primary)] group-hover:text-[var(--color-primary)]">
                  {tool.title}
                </h3>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{tool.description}</p>
              <div className="mt-4">
                <span className="inline-flex items-center font-semibold text-sm text-[var(--color-primary)]">
                  شروع کنید
                  <svg
                    className="me-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 17l9.2-9.2M17 17V7H7"
                    />
                  </svg>
                </span>
              </div>
            </Link>
          </Card>
        ))}
      </div>

      <section className="section-surface p-8">
        <h2 className="text-2xl font-black text-[var(--text-primary)] text-center mb-8">
          چرا ابزارهای تاریخ ما؟
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: '⚡',
              title: 'سریع و دقیق',
              desc: 'محاسبات تاریخی با الگوریتم‌های استاندارد و خروجی فوری',
            },
            {
              icon: '🔒',
              title: 'امن و محرمانه',
              desc: 'تمام محاسبات در مرورگر شما انجام می‌شود',
            },
            { icon: '💎', title: 'رایگان و نامحدود', desc: 'بدون محدودیت در تعداد استفاده' },
          ].map((item) => (
            <Card key={item.title} className="text-center p-6">
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{item.title}</h3>
              <p className="text-[var(--text-muted)] text-sm">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
