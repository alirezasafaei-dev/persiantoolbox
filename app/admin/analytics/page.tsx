'use client';

import { useState, useEffect, useCallback } from 'react';
import Card from '@/shared/ui/Card';
import DataTable from '@/shared/ui/DataTable';
import Tabs from '@/shared/ui/Tabs';
import BarChart from '@/shared/ui/charts/BarChart';
import PieChart from '@/shared/ui/charts/PieChart';
import LineChart from '@/shared/ui/charts/LineChart';

type AnalyticsData = {
  totalEvents: number;
  topPaths: Array<{ path: string; views: number }>;
  topEvents: Array<{ event: string; count: number }>;
  dailyViews: Array<{ date: string; views: number }>;
  categoryBreakdown: Array<{ category: string; views: number }>;
  lastUpdated: string;
};

type DateRange = 'all' | 'today' | '7d' | '30d';

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: 'all', label: 'همه زمان‌ها' },
  { value: '30d', label: '۳۰ روز اخیر' },
  { value: '7d', label: '۷ روز اخیر' },
  { value: 'today', label: 'امروز' },
];

function toCSV(data: AnalyticsData): string {
  const lines: string[] = [];
  lines.push('Metric,Value');
  lines.push(`Total Views,${data.totalEvents}`);
  lines.push('');
  lines.push('--- Top Paths ---');
  lines.push('Path,Views');
  for (const p of data.topPaths) {
    lines.push(`${p.path},${p.views}`);
  }
  lines.push('');
  lines.push('--- Events ---');
  lines.push('Event,Count');
  for (const e of data.topEvents) {
    lines.push(`${e.event},${e.count}`);
  }
  lines.push('');
  lines.push('--- Category Breakdown ---');
  lines.push('Category,Views');
  for (const c of data.categoryBreakdown) {
    lines.push(`${c.category},${c.views}`);
  }
  lines.push('');
  lines.push('--- Daily Views ---');
  lines.push('Date,Views');
  for (const d of data.dailyViews) {
    lines.push(`${d.date},${d.views}`);
  }
  return lines.join('\n');
}

function downloadCSV(data: AnalyticsData) {
  const csv = toCSV(data);
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) {
    return `${sec} ثانیه پیش`;
  }
  const min = Math.floor(sec / 60);
  if (min < 60) {
    return `${min} دقیقه پیش`;
  }
  const hr = Math.floor(min / 60);
  return `${hr} ساعت پیش`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>('all');
  const [lastFetched, setLastFetched] = useState<string>('');

  const fetchData = useCallback(async (r: DateRange) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${r}`);
      const json = await res.json();
      setData(json);
      setLastFetched(new Date().toISOString());
    } catch {
      // keep previous data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  const pathColumns = [
    { key: 'path', header: 'مسیر', sortable: true },
    {
      key: 'views',
      header: 'بازدید',
      sortable: true,
      render: (row: Record<string, unknown>) => Number(row['views']).toLocaleString('fa-IR'),
    },
  ];

  const eventColumns = [
    { key: 'event', header: 'رویداد', sortable: true },
    {
      key: 'count',
      header: 'تعداد',
      sortable: true,
      render: (row: Record<string, unknown>) => Number(row['count']).toLocaleString('fa-IR'),
    },
  ];

  const topPathsForChart = (data?.topPaths ?? [])
    .slice(0, 8)
    .map((p) => ({ label: p.path.replace(/^\//, '').split('/').pop() ?? p.path, value: p.views }));

  const eventsForChart = (data?.topEvents ?? []).map((e) => ({
    label: e.event,
    value: e.count,
  }));

  const categoryForChart = (data?.categoryBreakdown ?? []).map((c) => ({
    label: c.category,
    value: c.views,
  }));

  const dailyForChart = [...(data?.dailyViews ?? [])].reverse().map((d) => ({
    label: d.date,
    value: d.views,
  }));

  const totalToolEvents = (data?.topEvents ?? [])
    .filter((e) => e.event.startsWith('tool_'))
    .reduce((s, e) => s + e.count, 0);
  const overallConversionRate =
    data && data.totalEvents > 0 ? ((totalToolEvents / data.totalEvents) * 100).toFixed(1) : '—';

  const pathConversionData = (data?.topPaths ?? []).slice(0, 8).map((p) => {
    const matchedEvent = (data?.topEvents ?? []).find(
      (e) => e.event === 'tool_run' && p.path.includes(e.event),
    );
    const estimatedConversions = matchedEvent
      ? Math.round((matchedEvent.count / (data?.topEvents.length ?? 1)) * 100)
      : 0;
    const rate = p.views > 0 ? ((estimatedConversions / p.views) * 100).toFixed(1) : '۰';
    return { path: p.path, views: p.views, conversions: estimatedConversions, rate };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">آمار و تحلیل</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">بررسی عملکرد سایت و رفتار کاربران</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {DATE_RANGES.map((dr) => (
            <button
              type="button"
              key={dr.value}
              onClick={() => setRange(dr.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                range === dr.value
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]'
              }`}
              aria-pressed={range === dr.value}
            >
              {dr.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span
            className={`inline-block h-2 w-2 rounded-full ${loading ? 'animate-pulse bg-[var(--color-warning)]' : 'bg-[var(--color-success)]'}`}
          />
          {lastFetched ? `آخرین بروزرسانی: ${formatTimeAgo(lastFetched)}` : 'در حال بارگذاری...'}
        </div>
        {data ? (
          <button
            type="button"
            onClick={() => downloadCSV(data)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface-2)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-3)]"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            خروجی CSV
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs text-[var(--text-muted)]">کل بازدیدها</p>
          <p className="mt-1 text-2xl font-black text-[var(--text-primary)]">
            {data?.totalEvents?.toLocaleString('fa-IR') ?? '۰'}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-[var(--text-muted)]">مسیرهای فعال</p>
          <p className="mt-1 text-2xl font-black text-[var(--text-primary)]">
            {data?.topPaths?.length?.toLocaleString('fa-IR') ?? '۰'}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-[var(--text-muted)]">رویدادها</p>
          <p className="mt-1 text-2xl font-black text-[var(--text-primary)]">
            {data?.topEvents?.length?.toLocaleString('fa-IR') ?? '۰'}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-[var(--text-muted)]">نرخ تعامل ابزارها</p>
          <p className="mt-1 text-2xl font-black text-[var(--text-primary)]">
            {overallConversionRate !== '—' ? `${overallConversionRate}%` : '—'}
          </p>
        </Card>
      </div>

      {dailyForChart.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-bold text-[var(--text-primary)]">روند بازدید روزانه</h3>
          <LineChart data={dailyForChart} height={160} />
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {topPathsForChart.length > 0 && (
          <Card className="p-5">
            <h3 className="mb-4 text-sm font-bold text-[var(--text-primary)]">مسیرهای پربازدید</h3>
            <BarChart data={topPathsForChart} height={180} />
          </Card>
        )}
        {categoryForChart.length > 0 && (
          <Card className="p-5">
            <h3 className="mb-4 text-sm font-bold text-[var(--text-primary)]">
              بازدید بر اساس دسته‌بندی
            </h3>
            <PieChart data={categoryForChart} size={160} />
          </Card>
        )}
        {eventsForChart.length > 0 && (
          <Card className="p-5">
            <h3 className="mb-4 text-sm font-bold text-[var(--text-primary)]">توزیع رویدادها</h3>
            <PieChart data={eventsForChart} size={160} />
          </Card>
        )}
      </div>

      <Card className="p-6">
        <Tabs
          tabs={[
            {
              id: 'paths',
              label: 'مسیرهای پربازدید',
              content: (
                <DataTable
                  columns={pathColumns}
                  data={(data?.topPaths ?? []) as unknown as Record<string, unknown>[]}
                  pageSize={10}
                  searchable
                  searchPlaceholder="جستجوی مسیر..."
                  emptyMessage="داده‌ای موجود نیست"
                />
              ),
            },
            {
              id: 'events',
              label: 'رویدادها',
              content: (
                <DataTable
                  columns={eventColumns}
                  data={(data?.topEvents ?? []) as unknown as Record<string, unknown>[]}
                  pageSize={10}
                  searchable
                  searchPlaceholder="جستجوی رویداد..."
                  emptyMessage="داده‌ای موجود نیست"
                />
              ),
            },
            {
              id: 'landing',
              label: 'فرود و تبدیل',
              content: (
                <div className="space-y-4">
                  <p className="text-sm text-[var(--text-muted)]">
                    مسیرهای فرود برتر با نرخ تعامل تخمینی (بر اساس رویدادهای ابزار)
                  </p>
                  <DataTable
                    columns={[
                      { key: 'path', header: 'مسیر', sortable: true },
                      {
                        key: 'views',
                        header: 'بازدید',
                        sortable: true,
                        render: (row: Record<string, unknown>) =>
                          Number(row['views']).toLocaleString('fa-IR'),
                      },
                      {
                        key: 'conversions',
                        header: 'تعامل',
                        sortable: true,
                        render: (row: Record<string, unknown>) =>
                          Number(row['conversions']).toLocaleString('fa-IR'),
                      },
                      {
                        key: 'rate',
                        header: 'نرخ تبدیل',
                        sortable: true,
                        render: (row: Record<string, unknown>) => `${row['rate']}%`,
                      },
                    ]}
                    data={pathConversionData as unknown as Record<string, unknown>[]}
                    pageSize={8}
                    emptyMessage="دادهٔ کافی برای تحلیل تبدیل وجود ندارد"
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
