'use client';

import { useState, lazy, Suspense } from 'react';
import { Card } from '@/components/ui';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';

const SalaryPage = lazy(() => import('@/components/features/salary/SalaryPage'));
const BonusCalculator = lazy(() => import('@/components/features/finance/BonusCalculator'));
const SeveranceCalculator = lazy(() => import('@/components/features/finance/SeveranceCalculator'));
const LeaveCalculator = lazy(() => import('@/components/features/finance/LeaveCalculator'));
const OvertimeCalculator = lazy(() => import('@/components/features/finance/OvertimeCalculator'));
const RetirementCalculator = lazy(
  () => import('@/components/features/finance/RetirementCalculator'),
);
const InsuranceCalculator = lazy(() => import('@/components/features/finance/InsuranceCalculator'));

type Tab = {
  id: string;
  label: string;
  icon: string;
};

const tabs: Tab[] = [
  { id: 'salary', label: 'محاسبه حقوق', icon: '💰' },
  { id: 'bonus', label: 'عیدی', icon: '🎁' },
  { id: 'severance', label: 'سنوات', icon: '📋' },
  { id: 'leave', label: 'مرخصی', icon: '🏖️' },
  { id: 'overtime', label: 'اضافه کاری', icon: '⏰' },
  { id: 'retirement', label: 'بازنشستگی', icon: '👴' },
  { id: 'insurance', label: 'بیمه', icon: '🏥' },
];

function TabFallback() {
  return (
    <div className="flex items-center justify-center py-16">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export default function SalaryHub() {
  const [activeTab, setActiveTab] = useState('salary');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          ابزارهای حقوق و دستمزد
        </h1>
        <p className="text-lg text-[var(--text-secondary)]">
          محاسبه حقوق، عیدی، سنوات، مرخصی، اضافه کاری و بازنشستگی
        </p>
      </div>

      <Card className="p-2">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="ابزارهای حقوق">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold transition-all duration-[var(--motion-fast)] ${
                activeTab === tab.id
                  ? 'bg-[var(--color-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-medium)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        <Suspense fallback={<TabFallback />}>
          {activeTab === 'salary' && <SalaryPage />}
          {activeTab === 'bonus' && <BonusCalculator />}
          {activeTab === 'severance' && <SeveranceCalculator />}
          {activeTab === 'leave' && <LeaveCalculator />}
          {activeTab === 'overtime' && <OvertimeCalculator />}
          {activeTab === 'retirement' && <RetirementCalculator />}
          {activeTab === 'insurance' && <InsuranceCalculator />}
        </Suspense>
      </div>
    </div>
  );
}
