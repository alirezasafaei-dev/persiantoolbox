'use client';

import { Card } from '@/components/ui';

type Browser = {
  name: string;
  icon: string;
  minVersion: string;
  status: 'full' | 'partial' | 'none';
  notes: string;
};

const BROWSERS: Browser[] = [
  {
    name: 'Chrome',
    icon: '🌐',
    minVersion: '90+',
    status: 'full',
    notes: 'پشتیبانی کامل از همه ابزارها',
  },
  {
    name: 'Firefox',
    icon: '🦊',
    minVersion: '90+',
    status: 'full',
    notes: 'پشتیبانی کامل از همه ابزارها',
  },
  {
    name: 'Safari',
    icon: '🧭',
    minVersion: '15+',
    status: 'full',
    notes: 'پشتیبانی کامل از همه ابزارها',
  },
  {
    name: 'Edge',
    icon: '🔷',
    minVersion: '90+',
    status: 'full',
    notes: 'پشتیبانی کامل از همه ابزارها',
  },
  {
    name: 'Opera',
    icon: '🔴',
    minVersion: '80+',
    status: 'full',
    notes: 'پشتیبانی کامل از همه ابزارها',
  },
];

type Feature = {
  name: string;
  browsers: Record<string, 'yes' | 'partial' | 'no'>;
};

const FEATURES: Feature[] = [
  {
    name: 'پردازش PDF',
    browsers: { Chrome: 'yes', Firefox: 'yes', Safari: 'yes', Edge: 'yes', Opera: 'yes' },
  },
  {
    name: 'پردازش تصویر',
    browsers: { Chrome: 'yes', Firefox: 'yes', Safari: 'yes', Edge: 'yes', Opera: 'yes' },
  },
  {
    name: 'Web Worker',
    browsers: { Chrome: 'yes', Firefox: 'yes', Safari: 'yes', Edge: 'yes', Opera: 'yes' },
  },
  {
    name: 'Canvas API',
    browsers: { Chrome: 'yes', Firefox: 'yes', Safari: 'yes', Edge: 'yes', Opera: 'yes' },
  },
  {
    name: 'File API',
    browsers: { Chrome: 'yes', Firefox: 'yes', Safari: 'yes', Edge: 'yes', Opera: 'yes' },
  },
  {
    name: 'LocalStorage',
    browsers: { Chrome: 'yes', Firefox: 'yes', Safari: 'yes', Edge: 'yes', Opera: 'yes' },
  },
  {
    name: 'Service Worker',
    browsers: { Chrome: 'yes', Firefox: 'yes', Safari: 'partial', Edge: 'yes', Opera: 'yes' },
  },
  {
    name: 'WebGL',
    browsers: { Chrome: 'yes', Firefox: 'yes', Safari: 'yes', Edge: 'yes', Opera: 'yes' },
  },
];

export default function CompatibilityPage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-success-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            سازگاری مرورگرها
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            اطلاعات سازگاری مرورگرها و ویژگی‌های مورد نیاز برای استفاده از ابزارها.
          </p>
        </div>
      </section>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">مرورگرهای پشتیبانی شده</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {BROWSERS.map((browser) => (
            <div
              key={browser.name}
              className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]"
            >
              <span className="text-2xl">{browser.icon}</span>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  {browser.name} {browser.minVersion}
                </div>
                <div className="text-xs text-[var(--color-success)]">پشتیبانی کامل</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">جدول سازگاری ویژگی‌ها</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-light)]">
                <th className="text-start py-2 text-[var(--text-muted)]">ویژگی</th>
                {BROWSERS.map((b) => (
                  <th key={b.name} className="text-center py-2 text-[var(--text-muted)]">
                    {b.icon} {b.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature) => (
                <tr key={feature.name} className="border-b border-[var(--border-light)]">
                  <td className="py-2 text-[var(--text-primary)]">{feature.name}</td>
                  {BROWSERS.map((b) => (
                    <td key={b.name} className="text-center py-2">
                      {feature.browsers[b.name] === 'yes'
                        ? '✅'
                        : feature.browsers[b.name] === 'partial'
                          ? '⚠️'
                          : '❌'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">نکات فنی</h2>
        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
          <li>• تمام پردازش‌ها در مرورگر انجام می‌شود و به اینترنت نیاز ندارد</li>
          <li>• برای بهترین تجربه، مرورگر خود را به‌روز نگه دارید</li>
          <li>• برخی ابزارها ممکن است در مرورگرهای قدیمی محدودیت داشته باشند</li>
          <li>• پشتیبانی از WebWorker برای پردازش‌های سنگین</li>
          <li>• حداکثر حجم فایل پیشنهادی: 50 مگابایت</li>
        </ul>
      </Card>
    </div>
  );
}
