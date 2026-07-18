'use client';

import { useCallback, useEffect, useState } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import BarChart from '@/shared/ui/charts/BarChart';

type MetricRow = {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

type HealthStatus = {
  ok: boolean;
  connected: boolean;
  readonly?: boolean;
  property?: string | null;
  candidates?: string[];
  error?: string;
};

type PerformanceData = {
  ok: boolean;
  property: string | null;
  page: string | null;
  windows: {
    current: { startDate: string; endDate: string };
    previous: { startDate: string; endDate: string };
  };
  totals: null | {
    current: Omit<MetricRow, 'key'>;
    previous: Omit<MetricRow, 'key'>;
    change: {
      clicks: number | null;
      impressions: number | null;
      ctr: number;
      position: number;
    };
  };
  daily: Array<MetricRow & { date: string }>;
  queries: Array<MetricRow & { query: string }>;
  pages: Array<MetricRow & { page: string }>;
  devices: Array<MetricRow & { device: string }>;
  opportunities: Array<MetricRow & { query: string; score: number }>;
  error?: string;
};

type SitemapData = {
  ok: boolean;
  property?: string;
  sitemaps: Array<{
    path: string;
    type: string;
    lastSubmitted: string;
    lastDownloaded: string;
    isPending: boolean;
    errors: number;
    warnings: number;
    contents: Array<{ type: string; submitted: number; indexed: number }>;
  }>;
  error?: string;
};

type ActiveTab = 'overview' | 'queries' | 'pages' | 'devices' | 'sitemaps';

const formatNumber = (value: number) => value.toLocaleString('fa-IR');
const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;
const formatPosition = (value: number) => value.toFixed(2);

const formatChange = (value: number | null, percent = true) => {
  if (value === null) {
    return 'جدید';
  }
  const rendered = percent ? `${(value * 100).toFixed(1)}%` : value.toFixed(2);
  return `${value > 0 ? '+' : ''}${rendered}`;
};

const changeTone = (value: number | null, inverse = false) => {
  if (value === null || value === 0) {
    return 'text-[var(--text-muted)]';
  }
  const improved = inverse ? value < 0 : value > 0;
  return improved ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]';
};

export default function GoogleSearchConsolePage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [sitemaps, setSitemaps] = useState<SitemapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [pageDraft, setPageDraft] = useState('');
  const [appliedPage, setAppliedPage] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const performanceParams = new URLSearchParams({ action: 'performance', rowLimit: '100' });
      if (appliedPage.trim()) {
        performanceParams.set('page', appliedPage.trim());
      }

      const [healthResponse, performanceResponse, sitemapResponse] = await Promise.all([
        fetch('/api/admin/google-search-console?action=health').then((response) => response.json()),
        fetch(`/api/admin/google-search-console?${performanceParams.toString()}`).then((response) =>
          response.json(),
        ),
        fetch('/api/admin/google-search-console?action=sitemaps').then((response) => response.json()),
      ]);

      setHealth(healthResponse as HealthStatus);
      setPerformance(performanceResponse as PerformanceData);
      setSitemaps(sitemapResponse as SitemapData);
    } catch {
      setHealth({ ok: false, connected: false, error: 'دریافت اطلاعات Search Console ناموفق بود.' });
      setPerformance(null);
      setSitemaps(null);
    } finally {
      setLoading(false);
    }
  }, [appliedPage]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const applyPageFilter = () => {
    setAppliedPage(pageDraft.trim());
  };

  const clearPageFilter = () => {
    setPageDraft('');
    setAppliedPage('');
  };

  if (loading && !health && !performance) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const current = performance?.totals?.current;
  const previous = performance?.totals?.previous;
  const change = performance?.totals?.change;
  const totalSitemapWarnings =
    sitemaps?.sitemaps.reduce((sum, item) => sum + item.warnings, 0) ?? 0;
  const totalSitemapErrors = sitemaps?.sitemaps.reduce((sum, item) => sum + item.errors, 0) ?? 0;
  const totalSubmitted =
    sitemaps?.sitemaps.reduce(
      (sum, item) =>
        sum + item.contents.reduce((innerSum, content) => innerSum + content.submitted, 0),
      0,
    ) ?? 0;
  const totalIndexed =
    sitemaps?.sitemaps.reduce(
      (sum, item) =>
        sum + item.contents.reduce((innerSum, content) => innerSum + content.indexed, 0),
      0,
    ) ?? 0;

  const tabs: Array<{ id: ActiveTab; label: string }> = [
    { id: 'overview', label: 'نمای کلی' },
    { id: 'queries', label: 'کوئری‌ها' },
    { id: 'pages', label: 'صفحات' },
    { id: 'devices', label: 'دستگاه‌ها' },
    { id: 'sitemaps', label: 'Sitemap' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Google Search Console</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            عملکرد جستجو، فرصت‌های CTR و وضعیت Sitemap با دسترسی فقط‌خواندنی
          </p>
        </div>
        <Button onClick={() => void loadData()} variant="secondary">
          بروزرسانی
        </Button>
      </header>

      <Card className="space-y-4 p-5 md:p-6">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
            <p className="text-xs text-[var(--text-muted)]">وضعیت اتصال</p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  health?.connected ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'
                }`}
              />
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {health?.connected ? 'متصل و فقط‌خواندنی' : 'قطع'}
              </span>
            </div>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4 md:col-span-2">
            <p className="text-xs text-[var(--text-muted)]">Property فعال</p>
            <p className="mt-2 break-all font-mono text-xs text-[var(--text-primary)]">
              {performance?.property ?? health?.property ?? '-'}
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
            <p className="text-xs text-[var(--text-muted)]">بازه جاری</p>
            <p className="mt-2 text-xs font-semibold text-[var(--text-primary)]">
              {performance
                ? `${performance.windows.current.startDate} تا ${performance.windows.current.endDate}`
                : '-'}
            </p>
          </div>
        </div>
        {health?.error || performance?.error ? (
          <p className="text-sm text-[var(--color-danger)]">
            {health?.error ?? performance?.error}
          </p>
        ) : null}
      </Card>

      <Card className="space-y-3 p-5 md:p-6">
        <label htmlFor="gsc-page-filter" className="text-sm font-bold text-[var(--text-primary)]">
          تحلیل یک صفحه خاص
        </label>
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            id="gsc-page-filter"
            type="text"
            dir="ltr"
            value={pageDraft}
            onChange={(event) => setPageDraft(event.target.value)}
            placeholder="/text-tools/address-fa-to-en"
            className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--text-primary)]"
          />
          <Button onClick={applyPageFilter}>اعمال فیلتر</Button>
          {appliedPage ? (
            <Button onClick={clearPageFilter} variant="secondary">
              حذف فیلتر
            </Button>
          ) : null}
        </div>
        {performance?.page ? (
          <p className="break-all text-xs text-[var(--text-muted)]" dir="ltr">
            {performance.page}
          </p>
        ) : null}
      </Card>

      {current && previous && change ? (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="شاخص‌های عملکرد">
          {[
            {
              label: 'کلیک',
              value: formatNumber(current.clicks),
              previous: formatNumber(previous.clicks),
              change: formatChange(change.clicks),
              tone: changeTone(change.clicks),
            },
            {
              label: 'نمایش',
              value: formatNumber(current.impressions),
              previous: formatNumber(previous.impressions),
              change: formatChange(change.impressions),
              tone: changeTone(change.impressions),
            },
            {
              label: 'CTR',
              value: formatPercent(current.ctr),
              previous: formatPercent(previous.ctr),
              change: formatChange(change.ctr, false),
              tone: changeTone(change.ctr),
            },
            {
              label: 'میانگین رتبه',
              value: formatPosition(current.position),
              previous: formatPosition(previous.position),
              change: formatChange(change.position, false),
              tone: changeTone(change.position, true),
            },
          ].map((item) => (
            <Card key={item.label} className="p-4">
              <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
              <p className="mt-2 text-2xl font-black text-[var(--text-primary)]">{item.value}</p>
              <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                <span className="text-[var(--text-muted)]">قبل: {item.previous}</span>
                <span className={`font-semibold ${item.tone}`}>{item.change}</span>
              </div>
            </Card>
          ))}
        </section>
      ) : null}

      <nav className="flex gap-1 overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-1">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`min-w-fit flex-1 rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' && performance?.ok ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="space-y-4 p-5 md:p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">روند روزانه کلیک</h2>
            {performance.daily.length > 0 ? (
              <div className="h-72">
                <BarChart
                  data={performance.daily.map((row) => ({
                    label: row.date.slice(5),
                    value: row.clicks,
                  }))}
                />
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">داده روزانه موجود نیست.</p>
            )}
          </Card>

          <Card className="space-y-4 p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">فرصت‌های CTR</h2>
              <span className="text-xs text-[var(--text-muted)]">
                {performance.opportunities.length.toLocaleString('fa-IR')} مورد
              </span>
            </div>
            <div className="space-y-2">
              {performance.opportunities.slice(0, 10).map((row) => (
                <div
                  key={row.query}
                  className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] p-3"
                >
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{row.query}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {formatNumber(row.impressions)} نمایش · CTR {formatPercent(row.ctr)} · رتبه{' '}
                    {formatPosition(row.position)}
                  </p>
                </div>
              ))}
              {performance.opportunities.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">فرصت معناداری در این بازه پیدا نشد.</p>
              ) : null}
            </div>
          </Card>
        </div>
      ) : null}

      {activeTab === 'queries' && performance?.ok ? (
        <MetricsTable
          title="کوئری‌های برتر"
          label="کوئری"
          rows={performance.queries.map((row) => ({ ...row, display: row.query }))}
        />
      ) : null}

      {activeTab === 'pages' && performance?.ok ? (
        <MetricsTable
          title="صفحات برتر"
          label="صفحه"
          rows={performance.pages.map((row) => ({ ...row, display: row.page }))}
          ltr
        />
      ) : null}

      {activeTab === 'devices' && performance?.ok ? (
        <MetricsTable
          title="عملکرد دستگاه‌ها"
          label="دستگاه"
          rows={performance.devices.map((row) => ({ ...row, display: row.device }))}
        />
      ) : null}

      {activeTab === 'sitemaps' ? (
        <Card className="space-y-4 p-5 md:p-6">
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ['ثبت‌شده', totalSubmitted],
              ['ایندکس‌شده', totalIndexed],
              ['هشدار', totalSitemapWarnings],
              ['خطا', totalSitemapErrors],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
                <p className="text-xs text-[var(--text-muted)]">{label}</p>
                <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
                  {Number(value).toLocaleString('fa-IR')}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {sitemaps?.sitemaps.map((sitemap) => (
              <article
                key={sitemap.path}
                className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="break-all font-mono text-xs text-[var(--text-primary)]" dir="ltr">
                    {sitemap.path}
                  </p>
                  <span className="text-xs text-[var(--text-muted)]">
                    {sitemap.isPending ? 'در انتظار' : 'فعال'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  خطا: {formatNumber(sitemap.errors)} · هشدار: {formatNumber(sitemap.warnings)}
                </p>
              </article>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function MetricsTable({
  title,
  label,
  rows,
  ltr = false,
}: {
  title: string;
  label: string;
  rows: Array<MetricRow & { display: string }>;
  ltr?: boolean;
}) {
  return (
    <Card className="space-y-4 p-5 md:p-6">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border-light)]">
              {[label, 'کلیک', 'نمایش', 'CTR', 'رتبه'].map((heading) => (
                <th key={heading} className="px-3 py-2 text-start font-semibold text-[var(--text-primary)]">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.display} className="border-b border-[var(--border-light)]">
                <td
                  className="max-w-md break-all px-3 py-2 text-[var(--text-primary)]"
                  dir={ltr ? 'ltr' : undefined}
                >
                  {row.display}
                </td>
                <td className="px-3 py-2 text-[var(--text-primary)]">{formatNumber(row.clicks)}</td>
                <td className="px-3 py-2 text-[var(--text-primary)]">
                  {formatNumber(row.impressions)}
                </td>
                <td className="px-3 py-2 text-[var(--text-primary)]">{formatPercent(row.ctr)}</td>
                <td className="px-3 py-2 text-[var(--text-primary)]">
                  {formatPosition(row.position)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">داده‌ای برای نمایش وجود ندارد.</p>
      ) : null}
    </Card>
  );
}
