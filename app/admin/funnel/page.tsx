'use client';

import { useState, useMemo } from 'react';
import BarChart from '@/shared/ui/charts/BarChart';
import LineChart from '@/shared/ui/charts/LineChart';
import PieChart from '@/shared/ui/charts/PieChart';
import Sparkline from '@/shared/ui/charts/Sparkline';
import { funnelStages } from '@/lib/funnel-events';

type Tab = 'overview' | 'dropoff' | 'abtest' | 'cohort' | 'revenue';

const FUNNEL_DATA = [
  { stage: 'آگاهی', users: 12400 },
  { stage: 'علاقه', users: 8700 },
  { stage: 'بررسی', users: 4200 },
  { stage: 'قصد', users: 1800 },
  { stage: 'تبدیل', users: 680 },
];

const DROP_OFF_DATA = [
  { stage: 'آگاهی → علاقه', dropOff: 29.8, users: 3700 },
  { stage: 'علاقه → بررسی', dropOff: 51.7, users: 4500 },
  { stage: 'بررسی → قصد', dropOff: 57.1, users: 2400 },
  { stage: 'قصد → تبدیل', dropOff: 62.2, users: 1120 },
];

const AB_TESTS = [
  {
    id: 1,
    name: 'CTA اصلی صفحه ابزار',
    variantA: { label: 'متن آبی', conversions: 340, total: 4100, rate: 8.3 },
    variantB: { label: 'دکمه سبز', conversions: 425, total: 4050, rate: 10.5 },
    winner: 'B',
    confidence: 97,
  },
  {
    id: 2,
    name: 'صفحه فرود پریمیوم',
    variantA: { label: 'قیمت‌دار', conversions: 180, total: 3200, rate: 5.6 },
    variantB: { label: 'بدون قیمت', conversions: 195, total: 3150, rate: 6.2 },
    winner: 'B',
    confidence: 72,
  },
  {
    id: 3,
    name: 'Popup خروج',
    variantA: { label: 'پاپ‌آپ ساده', conversions: 95, total: 2100, rate: 4.5 },
    variantB: { label: 'پاپ‌آپ + تخفیف', conversions: 145, total: 2050, rate: 7.1 },
    winner: 'B',
    confidence: 99,
  },
  {
    id: 4,
    name: 'فرم ثبت‌نام',
    variantA: { label: '۳ فیلد', conversions: 520, total: 5800, rate: 9.0 },
    variantB: { label: '۵ فیلد', conversions: 380, total: 5700, rate: 6.7 },
    winner: 'A',
    confidence: 99,
  },
];

const COHORT_DATA = [
  { month: 'فروردین', users: 420, retention30: 38, retention90: 22, retention180: 14, premium: 8 },
  {
    month: 'اردیبهشت',
    users: 510,
    retention30: 41,
    retention90: 25,
    retention180: 16,
    premium: 10,
  },
  { month: 'خرداد', users: 630, retention30: 44, retention90: 28, retention180: 19, premium: 12 },
  { month: 'تیر', users: 580, retention30: 39, retention90: 24, retention180: 17, premium: 9 },
  { month: 'مرداد', users: 720, retention30: 46, retention90: 30, retention180: 0, premium: 14 },
  { month: 'شهریور', users: 810, retention30: 48, retention90: 0, retention180: 0, premium: 16 },
  { month: 'مهر', users: 950, retention30: 50, retention90: 0, retention180: 0, premium: 18 },
];

const REVENUE_DATA = [
  { tool: 'محاسبه حقوق', conversions: 180, revenue: 9000000, share: 26.5 },
  { tool: 'ادغام PDF', conversions: 145, revenue: 7250000, share: 21.3 },
  { tool: 'تبدیل تاریخ', conversions: 98, revenue: 4900000, share: 14.4 },
  { tool: 'محاسبه وام', conversions: 85, revenue: 4250000, share: 12.5 },
  { tool: 'رزومه‌ساز', conversions: 72, revenue: 3600000, share: 10.6 },
  { tool: 'حذف پس‌زمینه', conversions: 55, revenue: 2750000, share: 8.1 },
  { tool: 'امضای آنلاین', conversions: 45, revenue: 2250000, share: 6.6 },
];

const MONTHLY_TREND = [
  { label: 'فروردین', value: 42 },
  { label: 'اردیبهشت', value: 51 },
  { label: 'خرداد', value: 63 },
  { label: 'تیر', value: 58 },
  { label: 'مرداد', value: 72 },
  { label: 'شهریور', value: 81 },
  { label: 'مهر', value: 95 },
  { label: 'آبان', value: 68 },
  { label: 'آذر', value: 74 },
  { label: 'دی', value: 88 },
  { label: 'بهمن', value: 92 },
  { label: 'اسفند', value: 105 },
];

function formatNumber(n: number): string {
  return new Intl.NumberFormat('fa-IR').format(n);
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)} میلیون`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(0)} هزار`;
  }
  return n.toString();
}

function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildFunnelCSV(): string {
  const header = 'مرحله,تعداد کاربر,نرخ تبدیل';
  const total = FUNNEL_DATA[0]!.users;
  const rows = FUNNEL_DATA.map(
    (d) => `${d.stage},${d.users},${((d.users / total) * 100).toFixed(1)}%`,
  );
  return [header, ...rows].join('\n');
}

function buildDropOffCSV(): string {
  const header = 'مرحله,نرخ ریزش,تعداد ریزش';
  const rows = DROP_OFF_DATA.map((d) => `${d.stage},${d.dropOff}%,${d.users}`);
  return [header, ...rows].join('\n');
}

function buildABTestCSV(): string {
  const header = 'نام تست,تبدیل A,نرخ A,تبدیل B,نرخ B,برنده,اطمینان';
  const rows = AB_TESTS.map(
    (t) =>
      `${t.name},${t.variantA.conversions},${t.variantA.rate}%,${t.variantB.conversions},${t.variantB.rate}%,${t.winner},${t.confidence}%`,
  );
  return [header, ...rows].join('\n');
}

function buildCohortCSV(): string {
  const header = 'ماه,کاربران,۳۰ روزه,۹۰ روزه,۱۸۰ روزه,پریمیوم';
  const rows = COHORT_DATA.map(
    (c) =>
      `${c.month},${c.users},${c.retention30 || '-'}%,${c.retention90 || '-'}%,${c.retention180 || '-'}%,${c.premium}`,
  );
  return [header, ...rows].join('\n');
}

function buildRevenueCSV(): string {
  const header = 'ابزار,تبدیل‌ها,درآمد (تومان),سهم';
  const rows = REVENUE_DATA.map((r) => `${r.tool},${r.conversions},${r.revenue},${r.share}%`);
  return [header, ...rows].join('\n');
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'نمای کلی' },
  { id: 'dropoff', label: 'ریزش کاربران' },
  { id: 'abtest', label: 'تست A/B' },
  { id: 'cohort', label: 'تحلیل کوهورت' },
  { id: 'revenue', label: 'درآمد ابزارها' },
];

const TAB_EXPORT_MAP: Record<Tab, () => void> = {
  overview: () => downloadCSV('funnel-overview.csv', buildFunnelCSV()),
  dropoff: () => downloadCSV('funnel-dropoff.csv', buildDropOffCSV()),
  abtest: () => downloadCSV('ab-tests.csv', buildABTestCSV()),
  cohort: () => downloadCSV('cohort-analysis.csv', buildCohortCSV()),
  revenue: () => downloadCSV('revenue-attribution.csv', buildRevenueCSV()),
};

export default function FunnelDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const funnelBarData = useMemo(
    () => FUNNEL_DATA.map((d) => ({ label: d.stage, value: d.users })),
    [],
  );

  const totalUsers = FUNNEL_DATA[0]!.users;
  const convertedUsers = FUNNEL_DATA[FUNNEL_DATA.length - 1]!.users;
  const overallRate = ((convertedUsers / totalUsers) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <section className="section-surface p-6 md:p-8">
          <h1 className="text-3xl font-black text-[var(--text-primary)]">قیف تبدیل</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            تحلیل مسیر کاربر از بازدید اولیه تا تبدیل نهایی. داده‌های ۱۲ ماه اخیر.
          </p>
        </section>

        <section className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
            <div className="text-xs text-[var(--text-muted)]">بازدید اولیه</div>
            <div className="text-2xl font-black text-[var(--text-primary)] mt-1">
              {formatNumber(totalUsers)}
            </div>
            <Sparkline data={MONTHLY_TREND} width={80} height={24} />
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
            <div className="text-xs text-[var(--text-muted)]">تبدیل نهایی</div>
            <div className="text-2xl font-black text-[var(--color-success)] mt-1">
              {formatNumber(convertedUsers)}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">نرخ {overallRate}%</div>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
            <div className="text-xs text-[var(--text-muted)]">درآمد ماهانه</div>
            <div className="text-2xl font-black text-[var(--text-primary)] mt-1">۳۳ میلیون</div>
            <div className="text-xs text-[var(--color-success)] mt-1">↑ ۱۲٪ نسبت به ماه قبل</div>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
            <div className="text-xs text-[var(--text-muted)]">تست‌های فعال</div>
            <div className="text-2xl font-black text-[var(--text-primary)] mt-1">
              {AB_TESTS.length}
            </div>
            <div className="text-xs text-[var(--color-success)] mt-1">
              {AB_TESTS.filter((t) => t.confidence >= 95).length} با اطمینان بالا
            </div>
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]">
          <div className="flex items-center gap-1 border-b border-[var(--border-light)] px-4 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              type="button"
              onClick={TAB_EXPORT_MAP[activeTab]}
              className="ms-auto mb-1 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--border-light)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-1)] transition-colors"
            >
              خروجی CSV
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">قیف تبدیل</h3>
                  <BarChart data={funnelBarData} height={200} color="var(--color-primary)" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">مراحل قیف</h3>
                  <div className="grid gap-3 md:grid-cols-5">
                    {FUNNEL_DATA.map((stage, i) => {
                      const pct = ((stage.users / totalUsers) * 100).toFixed(1);
                      const prev = i > 0 ? FUNNEL_DATA[i - 1]!.users : stage.users;
                      const stageColor = funnelStages[i]?.color ?? 'var(--color-primary)';
                      return (
                        <div
                          key={stage.stage}
                          className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-2)] p-4 text-center space-y-2"
                        >
                          <div className="text-xs text-[var(--text-muted)]">مرحله {i + 1}</div>
                          <div className="text-lg font-black" style={{ color: stageColor }}>
                            {formatNumber(stage.users)}
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">{stage.stage}</div>
                          <div className="h-1.5 rounded-full bg-[var(--surface-1)] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: stageColor }}
                            />
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)]">{pct}% کل</div>
                          {i > 0 && (
                            <div className="text-[10px] text-[var(--color-danger)]">
                              ↓ {((1 - stage.users / prev) * 100).toFixed(0)}% ریزش
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                    روند تبدیل ماهانه
                  </h3>
                  <LineChart data={MONTHLY_TREND} height={150} color="var(--color-primary)" />
                </div>
              </div>
            )}

            {activeTab === 'dropoff' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                    نقاط ریزش قیف
                  </h3>
                  <BarChart
                    data={DROP_OFF_DATA.map((d) => ({ label: d.stage, value: d.dropOff }))}
                    height={180}
                    color="var(--color-danger)"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {DROP_OFF_DATA.map((d) => (
                    <div
                      key={d.stage}
                      className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-2)] p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[var(--text-primary)]">
                          {d.stage}
                        </span>
                        <span className="text-sm font-black text-[var(--color-danger)]">
                          {d.dropOff}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--surface-1)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--color-danger)]"
                          style={{ width: `${d.dropOff}%` }}
                        />
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {formatNumber(d.users)} کاربر در این مرحله ریزش کرده‌اند
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-2)] p-5">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">
                    پیشنهاد بهبود
                  </h4>
                  <ul className="text-sm text-[var(--text-secondary)] space-y-1.5">
                    <li>
                      • بزرگ‌ترین ریزش در مرحله <strong>قصد → تبدیل</strong> (۶۲٪) — بهینه‌سازی فرم
                      پرداخت
                    </li>
                    <li>
                      • ریزش <strong>بررسی → قصد</strong> (۵۷٪) — بهبود صفحه قیمت‌گذاری و CTA
                    </li>
                    <li>
                      • ریزش <strong>علاقه → بررسی</strong> (۵۲٪) — افزودن social proof در صفحه
                      ابزارها
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'abtest' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">نتایج تست‌های A/B</h3>
                {AB_TESTS.map((test) => (
                  <div
                    key={test.id}
                    className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-2)] p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">{test.name}</h4>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          test.confidence >= 95
                            ? 'bg-[rgb(var(--color-success-rgb)/0.15)] text-[var(--color-success)]'
                            : 'bg-[var(--surface-1)] text-[var(--text-muted)]'
                        }`}
                      >
                        اطمینان {test.confidence}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`rounded-[var(--radius-md)] p-4 space-y-1 ${
                          test.winner === 'A'
                            ? 'border-2 border-[var(--color-success)] bg-[rgb(var(--color-success-rgb)/0.05)]'
                            : 'border border-[var(--border-light)] bg-[var(--surface-1)]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--text-muted)]">A</span>
                          <span className="text-xs text-[var(--text-secondary)]">
                            {test.variantA.label}
                          </span>
                          {test.winner === 'A' && (
                            <span className="text-[10px] text-[var(--color-success)]">● برنده</span>
                          )}
                        </div>
                        <div className="text-lg font-black text-[var(--text-primary)]">
                          {test.variantA.rate}%
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          {formatNumber(test.variantA.conversions)} /{' '}
                          {formatNumber(test.variantA.total)}
                        </div>
                      </div>
                      <div
                        className={`rounded-[var(--radius-md)] p-4 space-y-1 ${
                          test.winner === 'B'
                            ? 'border-2 border-[var(--color-success)] bg-[rgb(var(--color-success-rgb)/0.05)]'
                            : 'border border-[var(--border-light)] bg-[var(--surface-1)]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--text-muted)]">B</span>
                          <span className="text-xs text-[var(--text-secondary)]">
                            {test.variantB.label}
                          </span>
                          {test.winner === 'B' && (
                            <span className="text-[10px] text-[var(--color-success)]">● برنده</span>
                          )}
                        </div>
                        <div className="text-lg font-black text-[var(--text-primary)]">
                          {test.variantB.rate}%
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          {formatNumber(test.variantB.conversions)} /{' '}
                          {formatNumber(test.variantB.total)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'cohort' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  تحلیل کوهورت — نرخ بازگشت
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-light)]">
                        <th className="py-2 px-3 text-right text-xs font-bold text-[var(--text-muted)]">
                          ماه ثبت‌نام
                        </th>
                        <th className="py-2 px-3 text-right text-xs font-bold text-[var(--text-muted)]">
                          کاربران
                        </th>
                        <th className="py-2 px-3 text-right text-xs font-bold text-[var(--text-muted)]">
                          ۳۰ روزه
                        </th>
                        <th className="py-2 px-3 text-right text-xs font-bold text-[var(--text-muted)]">
                          ۹۰ روزه
                        </th>
                        <th className="py-2 px-3 text-right text-xs font-bold text-[var(--text-muted)]">
                          ۱۸۰ روزه
                        </th>
                        <th className="py-2 px-3 text-right text-xs font-bold text-[var(--text-muted)]">
                          پریمیوم
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {COHORT_DATA.map((row) => (
                        <tr
                          key={row.month}
                          className="border-b border-[var(--border-light)] last:border-b-0"
                        >
                          <td className="py-2.5 px-3 text-[var(--text-primary)] font-semibold">
                            {row.month}
                          </td>
                          <td className="py-2.5 px-3 text-[var(--text-secondary)]">
                            {formatNumber(row.users)}
                          </td>
                          <td className="py-2.5 px-3">
                            {row.retention30 > 0 ? (
                              <span className="inline-flex items-center gap-1">
                                <span
                                  className="inline-block h-1.5 rounded-full bg-[var(--color-primary)]"
                                  style={{ width: `${row.retention30}px` }}
                                />
                                <span className="text-[var(--text-secondary)]">
                                  {row.retention30}%
                                </span>
                              </span>
                            ) : (
                              <span className="text-[var(--text-muted)]">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {row.retention90 > 0 ? (
                              <span className="inline-flex items-center gap-1">
                                <span
                                  className="inline-block h-1.5 rounded-full bg-[var(--color-warning)]"
                                  style={{ width: `${row.retention90}px` }}
                                />
                                <span className="text-[var(--text-secondary)]">
                                  {row.retention90}%
                                </span>
                              </span>
                            ) : (
                              <span className="text-[var(--text-muted)]">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {row.retention180 > 0 ? (
                              <span className="inline-flex items-center gap-1">
                                <span
                                  className="inline-block h-1.5 rounded-full bg-[var(--color-success)]"
                                  style={{ width: `${row.retention180}px` }}
                                />
                                <span className="text-[var(--text-secondary)]">
                                  {row.retention180}%
                                </span>
                              </span>
                            ) : (
                              <span className="text-[var(--text-muted)]">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[var(--color-success)] font-semibold">
                            {row.premium}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-2)] p-4">
                    <div className="text-xs text-[var(--text-muted)]">میانگین نگهداری ۳۰ روزه</div>
                    <div className="text-xl font-black text-[var(--text-primary)] mt-1">
                      {Math.round(
                        COHORT_DATA.reduce((s, c) => s + c.retention30, 0) / COHORT_DATA.length,
                      )}
                      %
                    </div>
                  </div>
                  <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-2)] p-4">
                    <div className="text-xs text-[var(--text-muted)]">میانگین نگهداری ۹۰ روزه</div>
                    <div className="text-xl font-black text-[var(--text-primary)] mt-1">
                      {Math.round(
                        COHORT_DATA.filter((c) => c.retention90 > 0).reduce(
                          (s, c) => s + c.retention90,
                          0,
                        ) / COHORT_DATA.filter((c) => c.retention90 > 0).length,
                      )}
                      %
                    </div>
                  </div>
                  <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-2)] p-4">
                    <div className="text-xs text-[var(--text-muted)]">نرخ تبدیل پریمیوم</div>
                    <div className="text-xl font-black text-[var(--color-success)] mt-1">
                      {(
                        (COHORT_DATA.reduce((s, c) => s + c.premium, 0) /
                          COHORT_DATA.reduce((s, c) => s + c.users, 0)) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'revenue' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                    مقایسه رایگان vs پریمیوم
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-2)] p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--text-primary)]">رایگان</span>
                        <span className="text-xs text-[var(--text-muted)]">۷۲٪ کاربران</span>
                      </div>
                      <div className="text-2xl font-black text-[var(--text-primary)]">
                        {formatNumber(8920)}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">کاربر فعال ماهانه</div>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                        میانگین ۳.۲ استفاده روزانه
                      </div>
                    </div>
                    <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-2)] p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--color-success)]">
                          پریمیوم
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">۲۸٪ کاربران</span>
                      </div>
                      <div className="text-2xl font-black text-[var(--color-success)]">
                        {formatNumber(3480)}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">کاربر فعال ماهانه</div>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-success)]" />
                        میانگین ۸.۷ استفاده روزانه
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-2)] p-4">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">بینش</h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      کاربران پریمیوم ۲.۷ برابر بیشتر از کاربران رایگان از ابزارها استفاده می‌کنند.
                      نرخ تبدیل رایگان → پریمیوم حدود ۴.۲٪ است.
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                      درآمد بر اساس ابزار
                    </h3>
                    <BarChart
                      data={REVENUE_DATA.map((d) => ({ label: d.tool, value: d.conversions }))}
                      height={200}
                      color="var(--color-success)"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                      سهم ابزارها
                    </h3>
                    <PieChart
                      data={REVENUE_DATA.map((d) => ({ label: d.tool, value: d.conversions }))}
                      size={160}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-light)]">
                        <th className="py-2 px-3 text-right text-xs font-bold text-[var(--text-muted)]">
                          ابزار
                        </th>
                        <th className="py-2 px-3 text-right text-xs font-bold text-[var(--text-muted)]">
                          تبدیل‌ها
                        </th>
                        <th className="py-2 px-3 text-right text-xs font-bold text-[var(--text-muted)]">
                          درآمد
                        </th>
                        <th className="py-2 px-3 text-right text-xs font-bold text-[var(--text-muted)]">
                          سهم
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {REVENUE_DATA.map((row) => (
                        <tr
                          key={row.tool}
                          className="border-b border-[var(--border-light)] last:border-b-0"
                        >
                          <td className="py-2.5 px-3 text-[var(--text-primary)] font-semibold">
                            {row.tool}
                          </td>
                          <td className="py-2.5 px-3 text-[var(--text-secondary)]">
                            {formatNumber(row.conversions)}
                          </td>
                          <td className="py-2.5 px-3 text-[var(--text-secondary)]">
                            {formatCurrency(row.revenue)} تومان
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 rounded-full bg-[var(--surface-1)] overflow-hidden w-20">
                                <div
                                  className="h-full rounded-full bg-[var(--color-success)]"
                                  style={{ width: `${row.share}%` }}
                                />
                              </div>
                              <span className="text-[var(--text-muted)] text-xs">{row.share}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-2)] p-5">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">بینش درآمدی</h4>
                  <ul className="text-sm text-[var(--text-secondary)] space-y-1.5">
                    <li>
                      • <strong>محاسبه حقوق</strong> و <strong>ادغام PDF</strong> بیش از ۴۷٪ درآمد
                      را تشکیل می‌دهند
                    </li>
                    <li>• ابزارهای مالی ۵۳٪ کل تبدیل‌ها را به خود اختصاص داده‌اند</li>
                    <li>
                      • <strong>رزومه‌ساز</strong> بالاترین نرخ رشد ماهانه (۱۸٪) را دارد
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
