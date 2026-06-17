'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(Math.round(amount));
}

type Category = {
  id: string;
  name: string;
  icon: string;
  items: Array<{ name: string; min: number; max: number; unit: string }>;
};

const CATEGORIES: Category[] = [
  {
    id: 'housing',
    name: 'مسکن',
    icon: '🏠',
    items: [
      { name: 'اجاره آپارتمان ۱ خوابه', min: 8000000, max: 25000000, unit: 'ماهانه' },
      { name: 'اجاره آپارتمان ۲ خوابه', min: 15000000, max: 40000000, unit: 'ماهانه' },
      { name: 'شارژ آپارتمان', min: 500000, max: 3000000, unit: 'ماهانه' },
    ],
  },
  {
    id: 'food',
    name: 'خوراک',
    icon: '🍽️',
    items: [
      { name: 'غذای رستوران (۱ وعده)', min: 200000, max: 800000, unit: 'هر وعده' },
      { name: 'سوپرمارکت (خانواده ۴ نفره)', min: 5000000, max: 15000000, unit: 'ماهانه' },
      { name: 'نان (۱ عدد)', min: 15000, max: 30000, unit: 'هر عدد' },
      { name: 'بنزین (۱ لیتر)', min: 15000, max: 15000, unit: 'هر لیتر' },
    ],
  },
  {
    id: 'transport',
    name: 'حمل‌ونقل',
    icon: '🚗',
    items: [
      { name: 'تاکسی (۱۰ کیلومتر)', min: 150000, max: 300000, unit: 'هر سفر' },
      { name: 'مترو (بلیت تک‌سفره)', min: 8000, max: 8000, unit: 'هر سفر' },
      { name: 'اتوبوس (بلیت)', min: 5000, max: 5000, unit: 'هر سفر' },
    ],
  },
  {
    id: 'utilities',
    name: 'قبوض',
    icon: '💡',
    items: [
      { name: 'برق', min: 500000, max: 3000000, unit: 'ماهانه' },
      { name: 'گاز', min: 200000, max: 2000000, unit: 'ماهانه' },
      { name: 'آب', min: 100000, max: 500000, unit: 'ماهانه' },
      { name: 'تلفن و اینترنت', min: 300000, max: 1000000, unit: 'ماهانه' },
    ],
  },
  {
    id: 'education',
    name: 'آموزش',
    icon: '📚',
    items: [
      { name: 'مدرسه دولتی', min: 5000000, max: 15000000, unit: 'سالانه' },
      { name: 'کلاس خصوصی', min: 2000000, max: 5000000, unit: 'ماهانه' },
    ],
  },
  {
    id: 'health',
    name: 'بهداشت',
    icon: '🏥',
    items: [
      { name: 'ویزیت پزشک', min: 300000, max: 1000000, unit: 'هر ویزیت' },
      { name: 'دارو', min: 200000, max: 1000000, unit: 'ماهانه' },
    ],
  },
];

export default function LivingCostPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['housing', 'food']);
  const [customValues, setCustomValues] = useState<Record<string, number>>({});

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const setCustomValue = (key: string, value: number) => {
    setCustomValues((prev) => ({ ...prev, [key]: value }));
  };

  const totals = useMemo(() => {
    const monthly: Record<string, number> = {};
    let totalMonthly = 0;

    for (const catId of selectedCategories) {
      const cat = CATEGORIES.find((c) => c.id === catId);
      if (!cat) {
        continue;
      }
      monthly[catId] = 0;
      for (const item of cat.items) {
        const key = `${catId}-${item.name}`;
        const customVal = customValues[key];
        const avg = customVal ?? Math.round((item.min + item.max) / 2);
        monthly[catId] += avg;
        totalMonthly += avg;
      }
    }

    return { monthly, totalMonthly, totalYearly: totalMonthly * 12 };
  }, [selectedCategories, customValues]);

  const breadcrumbItems = [
    { label: 'ابزارها', href: '/tools' },
    { label: 'ابزارهای مالی', href: '/tools' },
    { label: 'محاسبه هزینه زندگی', current: true },
  ];

  return (
    <div className="space-y-8">
      <Breadcrumbs items={breadcrumbItems} />

      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            محاسبه هزینه زندگی
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            هزینه‌های زندگی ماهانه و سالانه خود را بر اساس دسته‌بندی‌های مختلف تخمین بزنید.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => toggleCategory(cat.id)}
            aria-pressed={selectedCategories.includes(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${selectedCategories.includes(cat.id) ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]' : 'bg-[var(--surface-1)] text-[var(--text-primary)] border border-[var(--border-light)]'}`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.filter((c) => selectedCategories.includes(c.id)).map((cat) => (
          <Card key={cat.id} className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {cat.icon} {cat.name}
            </h3>
            {cat.items.map((item) => {
              const key = `${cat.id}-${item.name}`;
              const customVal = customValues[key];
              const avg = customVal ?? Math.round((item.min + item.max) / 2);
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>{item.name}</span>
                    <span>{item.unit}</span>
                  </div>
                  <input
                    type="number"
                    value={customVal ?? ''}
                    placeholder={`${formatMoney(avg)} (میانگین)`}
                    onChange={(e) => setCustomValue(key, parseFloat(e.target.value) || 0)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-2 text-xs text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                    aria-label={item.name}
                  />
                </div>
              );
            })}
            <div className="text-xs font-bold text-[var(--color-primary)] pt-2 border-t border-[var(--border-light)]">
              ماهانه: {formatMoney(totals.monthly[cat.id] ?? 0)} تومان
            </div>
          </Card>
        ))}
      </div>

      {totals.totalMonthly > 0 && (
        <Card className="p-6 border-[var(--color-primary)]/30 bg-[rgb(var(--color-primary-rgb)/0.05)]">
          <div className="grid gap-4 md:grid-cols-3 text-center">
            <div>
              <div className="text-xs text-[var(--text-muted)]">هزینه ماهانه</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {formatMoney(totals.totalMonthly)}
              </div>
              <div className="text-xs text-[var(--text-muted)]">تومان</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-muted)]">هزینه سالانه</div>
              <div className="text-2xl font-bold text-[var(--color-primary)]">
                {formatMoney(totals.totalYearly)}
              </div>
              <div className="text-xs text-[var(--text-muted)]">تومان</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-muted)]">تعداد دسته‌بندی</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {selectedCategories.length}
              </div>
              <div className="text-xs text-[var(--text-muted)]">دسته فعال</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
