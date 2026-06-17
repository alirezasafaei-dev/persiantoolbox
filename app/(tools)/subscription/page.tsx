'use client';

import Card from '@/shared/ui/Card';
import Alert from '@/shared/ui/Alert';

export default function SubscriptionPage() {
  return (
    <div className="section-surface p-6 md:p-8 space-y-6">
      <Alert variant="info" title="به‌زودی">
        قابلیت اشتراک و مدیریت پرداخت هنوز منتشر نشده است. این صفحه نمونه اولیه است و داده‌های واقعی
        ندارد.
      </Alert>

      <h1 className="text-2xl font-bold text-[var(--text-primary)]">مدیریت اشتراک</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 opacity-60 pointer-events-none">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">اشتراک فعلی</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">طرح:</span>
              <span className="font-medium text-[var(--text-primary)]">—</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">وضعیت:</span>
              <span className="font-medium text-[var(--text-muted)]">غیرفعال</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">تاریخ انقضا:</span>
              <span className="font-medium text-[var(--text-primary)]">—</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 opacity-60 pointer-events-none">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">تاریخچه پرداخت</h2>
          <p className="text-sm text-[var(--text-muted)]">تاریخچه پرداختی وجود ندارد.</p>
        </Card>
      </div>
    </div>
  );
}
