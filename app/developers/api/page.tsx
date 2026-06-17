'use client';

import { Card } from '@/components/ui';

const endpoints = [
  { method: 'GET', path: '/api/health', description: 'بررسی سلامت سیستم', auth: false },
  { method: 'GET', path: '/api/ready', description: 'بررسی آمادگی سرور', auth: false },
  { method: 'GET', path: '/api/version', description: 'نمایش نسخه', auth: false },
  { method: 'GET', path: '/api/live', description: 'وضعیت سایت زنده', auth: false },
  { method: 'GET', path: '/api/metrics', description: 'متریک‌های سیستم', auth: true },
  { method: 'GET', path: '/api/errors', description: 'گزارش خطاها', auth: true },
  { method: 'GET', path: '/api/admin/stats', description: 'آمار ادمین', auth: true },
  { method: 'POST', path: '/api/history', description: 'ثبت تاریخچه', auth: true },
  { method: 'GET', path: '/api/history', description: 'دریافت تاریخچه', auth: true },
  { method: 'DELETE', path: '/api/history', description: 'حذف تاریخچه', auth: true },
];

export default function APIDocsPage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">مستندات API</h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            مستندات کامل API برای توسعه‌دهندگان. تمام اندپوینت‌ها با نمونه کد.
          </p>
        </div>
      </section>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">اندپوینت‌های عمومی</h2>
        <div className="space-y-3">
          {endpoints
            .filter((e) => !e.auth)
            .map((ep) => (
              <div
                key={ep.path}
                className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)]"
              >
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${ep.method === 'GET' ? 'bg-[var(--color-success)] text-white' : ep.method === 'POST' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-danger)] text-white'}`}
                >
                  {ep.method}
                </span>
                <code className="text-sm font-mono text-[var(--text-primary)]">{ep.path}</code>
                <span className="text-xs text-[var(--text-muted)]">{ep.description}</span>
              </div>
            ))}
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">نمونه کد</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">بررسی سلامت</h3>
            <pre className="bg-[var(--bg-subtle)] p-4 rounded-[var(--radius-md)] text-xs font-mono overflow-x-auto">
              {`fetch('https://persiantoolbox.ir/api/health')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`}
            </pre>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">با curl</h3>
            <pre className="bg-[var(--bg-subtle)] p-4 rounded-[var(--radius-md)] text-xs font-mono overflow-x-auto">
              {'curl -s https://persiantoolbox.ir/api/health | jq'}
            </pre>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">محدودیت‌ها</h2>
        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
          <li>• حداکثر 100 درخواست در دقیقه برای اندپوینت‌های عمومی</li>
          <li>• حداکثر 10 درخواست در دقیقه برای اندپوینت‌های ادمین</li>
          <li>• حداکثر حجم درخواست: 1 مگابایت</li>
          <li>• فرمت پاسخ: JSON</li>
        </ul>
      </Card>
    </div>
  );
}
