'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui';
import Link from 'next/link';

type Scenario = {
  id: string;
  title: string;
  scenario_type: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  notes: string;
  created_at: number;
  updated_at: number;
};

const REPORT_MAP: Record<string, { path: string; label: string }> = {
  check_penalty: { path: '/tools/report-generator', label: 'گزارش خسارت چک' },
  mahr: { path: '/tools/report-generator', label: 'گزارش مهریه' },
  debt_adjustment: { path: '/tools/report-generator', label: 'گزارش تعدیل بدهی' },
};

const SCENARIO_TYPES: Record<string, string> = {
  salary: 'محاسبه حقوق',
  loan: 'محاسبه وام',
  tax: 'محاسبه مالیات',
  investment: 'سرمایه‌گذاری',
  inflation: 'تورم',
  check_penalty: 'خسارت چک',
  vat: 'مالیات ارزش افزوده',
  mahr: 'مهریه',
  hiring_cost: 'هزینه استخدام',
  profit_margin: 'حاشیه سود',
};

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(timestamp));
}

export default function FinancialDashboard() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadScenarios = useCallback(async () => {
    try {
      const res = await fetch('/api/financial/scenarios');
      if (res.ok) {
        const data = await res.json();
        setScenarios(data.scenarios ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadScenarios();
  }, [loadScenarios]);

  const deleteScenario = async (id: string) => {
    await fetch(`/api/financial/scenarios/${id}`, { method: 'DELETE' });
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id].slice(0, 3),
    );
  };

  const selectedScenarios = scenarios.filter((s) => selectedIds.includes(s.id));

  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-12"
        role="status"
        aria-label="در حال بارگذاری"
      >
        <div className="text-[var(--text-muted)]">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">سناریوهای مالی ذخیره‌شده</h2>
        <Link href="/tools" className="text-sm text-[var(--color-primary)] hover:underline">
          + سناریوی جدید
        </Link>
      </div>

      {scenarios.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-[var(--text-muted)]">هنوز سناریویی ذخیره نکرده‌اید.</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            از صفحه ابزارهای مالی، نتیجه محاسبات را ذخیره کنید.
          </p>
        </Card>
      )}

      {scenarios.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <Card
              key={scenario.id}
              className={`p-4 cursor-pointer transition-colors ${
                selectedIds.includes(scenario.id)
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                  : ''
              }`}
              role="button"
              tabIndex={0}
              onClick={() => toggleSelect(scenario.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleSelect(scenario.id);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    {scenario.title}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {SCENARIO_TYPES[scenario.scenario_type] ?? scenario.scenario_type}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void deleteScenario(scenario.id);
                  }}
                  className="text-xs text-[var(--color-danger)] hover:underline"
                >
                  حذف
                </button>
              </div>
              <div className="mt-2 text-xs text-[var(--text-muted)]">
                {formatDate(scenario.updated_at)}
              </div>
              {(() => {
                const report = REPORT_MAP[scenario.scenario_type];
                if (!report) {
                  return null;
                }
                return (
                  <Link
                    href={report.path}
                    className="mt-2 inline-block text-xs text-[var(--color-primary)] hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {report.label}
                  </Link>
                );
              })()}
            </Card>
          ))}
        </div>
      )}

      {selectedScenarios.length >= 2 && (
        <Card className="p-4">
          <div className="text-sm font-bold text-[var(--text-primary)] mb-2">
            مقایسه {selectedScenarios.length} سناریو
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">مقایسه سناریوها</caption>
              <thead>
                <tr className="border-b border-[var(--border-light)]">
                  <th scope="col" className="py-2 px-3 text-right text-[var(--text-muted)]">
                    ویژگی
                  </th>
                  {selectedScenarios.map((s) => (
                    <th
                      key={s.id}
                      scope="col"
                      className="py-2 px-3 text-right text-[var(--text-primary)]"
                    >
                      {s.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(selectedScenarios[0]?.inputs ?? {}).map((key) => (
                  <tr key={key} className="border-b border-[var(--border-light)]">
                    <td className="py-2 px-3 text-[var(--text-muted)]">{key}</td>
                    {selectedScenarios.map((s) => (
                      <td key={s.id} className="py-2 px-3 text-[var(--text-primary)]">
                        {String(s.inputs[key] ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/tools/report-generator"
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          ساخت گزارش مالی
        </Link>
        <Link
          href="/tools/invoice-generator"
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          ساخت فاکتور
        </Link>
      </div>
    </div>
  );
}
