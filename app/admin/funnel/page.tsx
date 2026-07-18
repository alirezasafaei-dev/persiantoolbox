'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import BarChart from '@/shared/ui/charts/BarChart';
import LineChart from '@/shared/ui/charts/LineChart';
import PieChart from '@/shared/ui/charts/PieChart';
import Sparkline from '@/shared/ui/charts/Sparkline';
import { funnelStages } from '@/lib/funnel-events';

type Tab = 'overview' | 'dropoff' | 'abtest' | 'cohort' | 'revenue';

type FunnelStage = { stage: string; users: number };
type DropOff = { stage: string; dropOff: number; users: number };
type Cohort = {
  month: string;
  users: number;
  retention30: number;
  retention90: number;
  retention180: number;
  premium: number;
};
type Revenue = { tool: string; conversions: number; revenue: number; share: number };

type FunnelData = {
  totalVisits: number;
  totalConversions: number;
  conversionRate: number;
  stages: FunnelStage[];
  dropOffs: DropOff[];
  cohorts: Cohort[];
  revenue: Revenue[];
  monthlyVisits: Array<{ label: string; value: number }>;
};

const EMPTY_DATA: FunnelData = {
  totalVisits: 0,
  totalConversions: 0,
  conversionRate: 0,
  stages: [],
  dropOffs: [],
  cohorts: [],
  revenue: [],
  monthlyVisits: [],
};

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

function buildFunnelCSV(stages: FunnelStage[]): string {
  const header = 'مرحله,تعداد کاربر,نرخ تبدیل';
  const total = stages[0]?.users ?? 1;
  const rows = stages.map((d) => `${d.stage},${d.users},${((d.users / total) * 100).toFixed(1)}%`);
  return [header, ...rows].join('\n');
}

function buildDropOffCSV(dropOffs: DropOff[]): string {
  const header = 'مرحله,نرخ ریزش,تعداد ریزش';
  const rows = dropOffs.map((d) => `${d.stage},${d.dropOff}%,${d.users}`);
  return [header, ...rows].join('\n');
}

function buildCohortCSV(cohorts: Cohort[]): string {
  const header = 'ماه,کاربران,۳۰ روزه,۹۰ روزه,۱۸۰ روزه,پریمیوم';
  const rows = cohorts.map(
    (c) =>
      `${c.month},${c.users},${c.retention30 || '-'}%,${c.retention90 || '-'}%,${c.retention180 || '-'}%,${c.premium}`,
  );
  return [header, ...rows].join('\n');
}

function buildRevenueCSV(revenue: Revenue[]): string {
  const header = 'ابزار,تبدیل‌ها,درآمد (تومان),سهم';
  const rows = revenue.map((r) => `${r.tool},${r.conversions},${r.revenue},${r.share}%`);
  return [header, ...rows].join('\n');
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'نمای کلی' },
  { id: 'dropoff', label: 'ریزش کاربران' },
  { id: 'abtest', label: 'تست A/B' },
  { id: 'cohort', label: 'تحلیل کوهورت' },
  { id: 'revenue', label: 'درآمد ابزارها' },
];

export default function FunnelDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [data, setData] = useState<FunnelData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/funnel');
      const json = await res.json();
      if (json.ok && json.data?.snapshot) {
        setData(json.data.snapshot);
      } else {
        setError('خطا در دریافت داده‌ها');
      }
    } catch {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const funnelBarData = useMemo(
    () => data.stages.map((d) => ({ label: d.stage, value: d.users })),
    [data.stages],
  );

  const totalUsers = data.totalVisits;
  const convertedUsers = data.totalConversions;
  const overallRate = data.conversionRate;

  const TAB_EXPORT_MAP: Record<Tab, () => void> = {
    overview: () => downloadCSV('funnel-overview.csv', buildFunnelCSV(data.stages)),
    dropoff: () => downloadCSV('funnel-dropoff.csv', buildDropOffCSV(data.dropOffs)),
    abtest: () => downloadCSV('ab-tests.csv', 'نام تست,تبدیل A,نرخ A,تبدیل B,نرخ B,برنده,اطمینان'),
    cohort: () => downloadCSV('cohort-analysis.csv', buildCohortCSV(data.cohorts)),
    revenue: () => downloadCSV('revenue-attribution.csv', buildRevenueCSV(data.revenue)),
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="section-surface p-6 md:p-8">
          <h1 className="text-3xl font-black text-[var(--text-primary)]">قیف تبدیل</h1>
          <p className="text-[var(--text-secondary)] mt-2">در حال بارگذاری داده‌ها...</p>
        </section>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 animate-pulse"
            >
              <div className="h-3 w-16 bg-[var(--surface-2)] rounded" />
              <div className="h-6 w-20 bg-[var(--surface-2)] rounded mt-2" />
              <div className="h-3 w-12 bg-[var(--surface-2)] rounded mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <section className="section-surface p-6 md:p-8">
          <h1 className="text-3xl font-black text-[var(--text-primary)]">قیف تبدیل</h1>
          <p className="text-[var(--color-danger)] mt-2">{error}</p>
          <button
            type="button"
            onClick={fetchData}
            className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-colors"
          >
            تلاش مجدد
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <section className="section-surface p-6 md:p-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-black text-[var(--text-primary)]">قیف تبدیل</h1>
              <p className="text-[var(--text-secondary)] mt-2">
                تحلیل مسیر کاربر از بازدید اولیه تا تبدیل نهایی. داده‌های واقعی از دیتابیس.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchData}
              className="rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--border-light)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-1)] transition-colors"
            >
              بروزرسانی داده
            </button>
          </div>
        </section>

        <section className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
            <div className="text-xs text-[var(--text-muted)]">بازدید اولیه</div>
            <div className="text-2xl font-black text-[var(--text-primary)] mt-1">
              {formatNumber(totalUsers)}
            </div>
            <Sparkline data={data.monthlyVisits} width={80} height={24} />
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
            <div className="text-xs text-[var(--text-muted)]">تبدیل نهایی</div>
            <div className="text-2xl font-black text-[var(--color-success)] mt-1">
              {formatNumber(convertedUsers)}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">نرخ {overallRate}%</div>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
            <div className="text-xs text-[var(--text-muted)]">درآمد تقریبی</div>
            <div className="text-2xl font-black text-[var(--text-primary)] mt-1">
              {formatCurrency(data.revenue.reduce((s, r) => s + r.revenue, 0))} تومان
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{data.revenue.length} ابزار</div>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
            <div className="text-xs text-[var(--text-muted)]">نرخ تبدیل</div>
            <div className="text-2xl font-black text-[var(--text-primary)] mt-1">
              {overallRate}%
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              {formatNumber(convertedUsers)} / {formatNumber(totalUsers)}
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
                  {funnelBarData.length > 0 ? (
                    <BarChart data={funnelBarData} height={200} color="var(--color-primary)" />
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">داده‌ای موجود نیست</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">مراحل قیف</h3>
                  <div className="grid gap-3 md:grid-cols-5">
                    {data.stages.map((stage, i) => {
                      const pct =
                        totalUsers > 0 ? ((stage.users / totalUsers) * 100).toFixed(1) : '0';
                      const prev = i > 0 ? (data.stages[i - 1]?.users ?? stage.users) : stage.users;
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
                          {i > 0 && prev > 0 && (
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
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">روند بازدید</h3>
                  {data.monthlyVisits.length > 0 ? (
                    <LineChart
                      data={data.monthlyVisits}
                      height={150}
                      color="var(--color-primary)"
                    />
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">داده‌ای موجود نیست</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'dropoff' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                    نقاط ریزش قیف
                  </h3>
                  {data.dropOffs.length > 0 ? (
                    <BarChart
                      data={data.dropOffs.map((d) => ({ label: d.stage, value: d.dropOff }))}
                      height={180}
                      color="var(--color-danger)"
                    />
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">داده‌ای موجود نیست</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {data.dropOffs.map((d) => (
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
              </div>
            )}

            {activeTab === 'abtest' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">تست‌های A/B</h3>
                <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-2)] p-8 text-center">
                  <p className="text-sm text-[var(--text-muted)]">
                    تست‌های A/B هنوز در دیتابیس ذخیره نشده‌اند. پس از راه‌اندازی سیستم تست A/B،
                    نتایج در اینجا نمایش داده خواهد شد.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'cohort' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  تحلیل کوهورت — نرخ بازگشت
                </h3>
                {data.cohorts.length > 0 ? (
                  <>
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
                          {data.cohorts.map((row) => (
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
                        <div className="text-xs text-[var(--text-muted)]">
                          میانگین نگهداری ۳۰ روزه
                        </div>
                        <div className="text-xl font-black text-[var(--text-primary)] mt-1">
                          {data.cohorts.length > 0
                            ? Math.round(
                                data.cohorts.reduce((s, c) => s + c.retention30, 0) /
                                  data.cohorts.length,
                              )
                            : 0}
                          %
                        </div>
                      </div>
                      <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-2)] p-4">
                        <div className="text-xs text-[var(--text-muted)]">
                          میانگین نگهداری ۹۰ روزه
                        </div>
                        <div className="text-xl font-black text-[var(--text-primary)] mt-1">
                          {(() => {
                            const with90 = data.cohorts.filter((c) => c.retention90 > 0);
                            return with90.length > 0
                              ? Math.round(
                                  with90.reduce((s, c) => s + c.retention90, 0) / with90.length,
                                )
                              : 0;
                          })()}
                          %
                        </div>
                      </div>
                      <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-2)] p-4">
                        <div className="text-xs text-[var(--text-muted)]">نرخ تبدیل پریمیوم</div>
                        <div className="text-xl font-black text-[var(--color-success)] mt-1">
                          {(() => {
                            const totalUsers = data.cohorts.reduce((s, c) => s + c.users, 0);
                            const totalPremium = data.cohorts.reduce((s, c) => s + c.premium, 0);
                            return totalUsers > 0
                              ? ((totalPremium / totalUsers) * 100).toFixed(1)
                              : '0';
                          })()}
                          %
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">داده‌ای موجود نیست</p>
                )}
              </div>
            )}

            {activeTab === 'revenue' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                    درآمد بر اساس ابزار
                  </h3>
                  {data.revenue.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <BarChart
                          data={data.revenue.map((d) => ({
                            label: d.tool,
                            value: d.conversions,
                          }))}
                          height={200}
                          color="var(--color-success)"
                        />
                      </div>
                      <div>
                        <PieChart
                          data={data.revenue.map((d) => ({
                            label: d.tool,
                            value: d.conversions,
                          }))}
                          size={160}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">داده‌ای موجود نیست</p>
                  )}
                </div>

                {data.revenue.length > 0 && (
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
                        {data.revenue.map((row) => (
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
                                <span className="text-[var(--text-muted)] text-xs">
                                  {row.share}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
