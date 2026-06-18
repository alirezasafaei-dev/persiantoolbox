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
  { name: 'Chrome', icon: '🌐', minVersion: '90+', status: 'full', notes: 'پشتیبانی کامل' },
  { name: 'Firefox', icon: '🦊', minVersion: '90+', status: 'full', notes: 'پشتیبانی کامل' },
  { name: 'Safari', icon: '🧭', minVersion: '15+', status: 'full', notes: 'پشتیبانی کامل' },
  { name: 'Edge', icon: '🔷', minVersion: '90+', status: 'full', notes: 'پشتیبانی کامل' },
  { name: 'Opera', icon: '🔴', minVersion: '80+', status: 'full', notes: 'پشتیبانی کامل' },
  { name: 'Samsung Internet', icon: '📱', minVersion: '15+', status: 'partial', notes: ' phần lớn ابزارها' },
];

const statusLabel = (s: Browser['status']) => {
  switch (s) {
    case 'full': return 'پشتیبانی کامل';
    case 'partial': return 'پشتیبانی جزئی';
    case 'none': return 'پشتیبانی نمی‌شود';
  }
};

const statusColor = (s: Browser['status']) => {
  switch (s) {
    case 'full': return 'text-[var(--color-success)]';
    case 'partial': return 'text-[var(--color-warning)]';
    case 'none': return 'text-[var(--color-danger)]';
  }
};

export default function CompatibilityContent() {
  return (
    <div className="space-y-8 py-8">
      <section className="section-surface rounded-[var(--radius-lg)] border border-[var(--border-light)] p-6 md:p-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">سازگاری مرورگرها</h1>
        <p className="text-[var(--text-secondary)]">
          جعبه ابزار فارسی با مرورگرهای مدرن سازگار است. تمام ابزارها در مرورگر اجرا می‌شوند و نیازی به نصب ندارند.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {BROWSERS.map((browser) => (
          <Card key={browser.name} className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{browser.icon}</span>
              <div>
                <h3 className="font-bold text-[var(--text-primary)]">{browser.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">نسخه {browser.minVersion}</p>
              </div>
            </div>
            <p className={`text-sm font-semibold ${statusColor(browser.status)}`}>
              {statusLabel(browser.status)}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">{browser.notes}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
