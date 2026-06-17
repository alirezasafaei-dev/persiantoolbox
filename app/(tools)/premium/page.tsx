'use client';

import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Alert from '@/shared/ui/Alert';

const plans = [
  {
    id: 'basic',
    name: 'پایه',
    price: '۹۹,۰۰۰',
    period: 'ماهانه',
    features: [
      'دسترسی به ابزارهای PDF',
      'دسترسی به ابزارهای تصویر',
      'حذف تبلیغات',
      '۵۰ استفاده روزانه',
    ],
  },
  {
    id: 'pro',
    name: 'حرفه‌ای',
    price: '۱۹۹,۰۰۰',
    period: 'ماهانه',
    popular: true,
    features: [
      'دسترسی به تمام ابزارها',
      'استفاده نامحدود',
      'خروجی در فرمت‌های مختلف',
      'اولویت پشتیبانی',
      'حذف تبلیغات',
    ],
  },
  {
    id: 'enterprise',
    name: 'سازمانی',
    price: '۴۹۹,۰۰۰',
    period: 'ماهانه',
    features: [
      'تمام امکانات حرفه‌ای',
      'API اختصاصی',
      'پشتیبانی اختصاصی',
      'گزارش‌های تحلیلی',
      'تعداد کاربران نامحدود',
    ],
  },
];

export default function PremiumPage() {
  return (
    <div className="section-surface p-6 md:p-8 space-y-8">
      <Alert variant="info" title="به‌زودی">
        طرح‌های اشتراک هنوز منتشر نشده‌اند. قیمت‌ها و امکانات نهایی ممکن است تغییر کنند.
      </Alert>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">اشتراک حرفه‌ای</h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          با اشتراک حرفه‌ای به تمام ابزارها دسترسی نامحدود داشته باشید
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${plan.popular ? 'border-2 border-[var(--color-primary)]' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-[var(--text-inverted)] px-4 py-1 rounded-full text-sm font-medium">
                محبوب‌ترین
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-[var(--color-primary)]">{plan.price}</span>
                <span className="text-[var(--text-secondary)]"> تومان/{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-[var(--text-primary)]">
                    <span className="text-[var(--color-success)]">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant={plan.popular ? 'primary' : 'secondary'} fullWidth disabled>
                به‌زودی
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
