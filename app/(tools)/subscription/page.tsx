'use client';

import {useState} from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';

const subscriptionHistory = [
  {id: 1, plan: 'حرفه‌ای', date: '۱۴۰۳/۰۳/۱۵', amount: '۱۹۹,۰۰۰', status: 'فعال'},
  {id: 2, plan: 'پایه', date: '۱۴۰۳/۰۲/۰۱', amount: '۹۹,۰۰۰', status: 'منقضی شده'},
];

export default function SubscriptionPage() {
  const [showCancel, setShowCancel] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-8">
        مدیریت اشتراک
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            اشتراک فعلی
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">طرح:</span>
              <span className="font-medium text-[var(--text-primary)]">حرفه‌ای</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">وضعیت:</span>
              <span className="font-medium text-green-600">فعال</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">تاریخ انقضا:</span>
              <span className="font-medium text-[var(--text-primary)]">۱۴۰۳/۰۴/۱۵</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">تمدید خودکار:</span>
              <span className="font-medium text-[var(--text-primary)]">فعال</span>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <Button variant="secondary" fullWidth>
              تغییر طرح
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => setShowCancel(true)}>
              لغو اشتراک
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            تاریخچه پرداخت
          </h2>
          <div className="space-y-4">
            {subscriptionHistory.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center pb-4 border-b border-[var(--border-light)]">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{item.plan}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{item.date}</p>
                </div>
                <div className="text-left">
                  <p className="font-medium text-[var(--text-primary)]">{item.amount} تومان</p>
                  <p
                    className={`text-sm ${
                      item.status === 'فعال' ? 'text-green-600' : 'text-[var(--text-secondary)]'
                    }`}>
                    {item.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {showCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              لغو اشتراک
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              آیا مطمئن هستید؟ پس از لغو، تا پایان دوره فعلی به ابزارها دسترسی خواهید داشت.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setShowCancel(false)}>
                انصراف
              </Button>
              <Button variant="danger" fullWidth>
                تایید لغو
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
