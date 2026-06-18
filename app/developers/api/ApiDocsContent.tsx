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
  { method: 'POST', path: '/api/subscription/checkout', description: 'ایجاد درخواست پرداخت', auth: true },
  { method: 'GET', path: '/api/subscription/status', description: 'وضعیت اشتراک', auth: true },
  { method: 'POST', path: '/api/subscription/webhook', description: 'وبهوک پرداخت', auth: false },
];

const methodColor = (method: string) => {
  switch (method) {
    case 'GET': return 'bg-[var(--color-success)] text-white';
    case 'POST': return 'bg-[var(--color-info)] text-white';
    case 'DELETE': return 'bg-[var(--color-danger)] text-white';
    default: return 'bg-[var(--text-muted)] text-white';
  }
};

export default function ApiDocsContent() {
  return (
    <div className="space-y-8 py-8">
      <section className="section-surface rounded-[var(--radius-lg)] border border-[var(--border-light)] p-6 md:p-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">مستندات API</h1>
        <p className="text-[var(--text-secondary)]">
          اندپوینت‌های API جعبه ابزار فارسی. تمام اندپوینت‌ها با JSON پاسخ می‌دهند.
        </p>
      </section>

      <div className="space-y-3">
        {endpoints.map((ep) => (
          <Card key={`${ep.method}-${ep.path}`} className="p-4">
            <div className="flex items-center gap-3">
              <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${methodColor(ep.method)}`}>
                {ep.method}
              </span>
              <code className="text-sm font-mono text-[var(--text-primary)]">{ep.path}</code>
              {ep.auth && (
                <span className="text-xs text-[var(--color-warning)]">🔑 نیاز به احراز هویت</span>
              )}
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-2">{ep.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
