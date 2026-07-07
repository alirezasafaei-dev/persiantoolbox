'use client';

import { useState, useEffect } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import BarChart from '@/shared/ui/charts/BarChart';

type HealthStatus = {
  ok: boolean;
  connected: boolean;
  property?: string | null;
  candidates?: string[];
  error?: string;
};

type IndexingData = {
  ok: boolean;
  property?: string;
  queries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
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
    contents: Array<{
      type: string;
      submitted: number;
      indexed: number;
    }>;
  }>;
  error?: string;
};

export default function GoogleSearchConsolePage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [indexing, setIndexing] = useState<IndexingData | null>(null);
  const [sitemaps, setSitemaps] = useState<SitemapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'health' | 'indexing' | 'sitemaps'>('health');

  const loadData = async () => {
    setLoading(true);
    try {
      const [healthRes, indexingRes, sitemapRes] = await Promise.all([
        fetch('/api/admin/google-search-console?action=health').then((r) => r.json()),
        fetch('/api/admin/google-search-console?action=indexing').then((r) => r.json()),
        fetch('/api/admin/google-search-console?action=sitemaps').then((r) => r.json()),
      ]);
      setHealth(healthRes);
      setIndexing(indexingRes);
      setSitemaps(sitemapRes);
    } catch {
      setHealth({ ok: false, connected: false, error: 'Failed to load' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Google Search Console</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">وضعیت ایندکس و جستجوی گوگل</p>
        </div>
        <Button onClick={loadData} variant="secondary">
          بروزرسانی
        </Button>
      </div>

      {/* Health Status */}
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
            <div
              className={`h-3 w-3 rounded-full ${
                health?.connected ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'
              }`}
            />
            <div>
              <p className="text-xs text-[var(--text-muted)]">وضعیت اتصال</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {health?.connected ? 'متصل' : 'قطع'}
              </p>
            </div>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
            <p className="text-xs text-[var(--text-muted)]">Property فعال</p>
            <p className="mt-1 font-mono text-xs text-[var(--text-primary)]">
              {health?.property ?? '-'}
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
            <p className="text-xs text-[var(--text-muted)]">هشدارهای Sitemap</p>
            <p
              className={`mt-1 text-sm font-semibold ${
                totalSitemapWarnings > 0
                  ? 'text-[var(--color-warning)]'
                  : 'text-[var(--color-success)]'
              }`}
            >
              {totalSitemapWarnings.toLocaleString('fa-IR')}
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
            <p className="text-xs text-[var(--text-muted)]">خطاهای Sitemap</p>
            <p
              className={`mt-1 text-sm font-semibold ${
                totalSitemapErrors > 0
                  ? 'text-[var(--color-danger)]'
                  : 'text-[var(--color-success)]'
              }`}
            >
              {totalSitemapErrors.toLocaleString('fa-IR')}
            </p>
          </div>
        </div>
        {health?.error ? (
          <p className="mt-3 text-xs text-[var(--color-danger)]">{health.error}</p>
        ) : null}
      </Card>

      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
            <p className="text-xs text-[var(--text-muted)]">URLهای ثبت‌شده در Sitemap</p>
            <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">
              {totalSubmitted.toLocaleString('fa-IR')}
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
            <p className="text-xs text-[var(--text-muted)]">URLهای ایندکس‌شده از Sitemap</p>
            <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">
              {totalIndexed.toLocaleString('fa-IR')}
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
            <p className="text-xs text-[var(--text-muted)]">Property داده‌های Query</p>
            <p className="mt-1 font-mono text-xs text-[var(--text-primary)]">
              {indexing?.property ?? '-'}
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-1">
        {(['health', 'indexing', 'sitemaps'] as const).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {(() => {
              if (tab === 'health') {
                return 'وضعیت';
              }
              if (tab === 'indexing') {
                return 'کلمات کلیدی';
              }
              return 'Sitemap';
            })()}
          </button>
        ))}
      </div>

      {/* Indexing Tab */}
      {activeTab === 'indexing' && indexing?.ok ? (
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">کلمات کلیدی برتر</h2>
          {indexing.queries.length > 0 ? (
            <>
              <div className="h-64">
                <BarChart
                  data={indexing.queries.slice(0, 8).map((q) => ({
                    label: q.query.length > 20 ? `${q.query.slice(0, 20)}...` : q.query,
                    value: q.clicks,
                  }))}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-light)]">
                      <th className="px-3 py-2 text-start font-semibold text-[var(--text-primary)]">
                        کلمه کلیدی
                      </th>
                      <th className="px-3 py-2 text-start font-semibold text-[var(--text-primary)]">
                        کلیک
                      </th>
                      <th className="px-3 py-2 text-start font-semibold text-[var(--text-primary)]">
                        نمایش
                      </th>
                      <th className="px-3 py-2 text-start font-semibold text-[var(--text-primary)]">
                        CTR
                      </th>
                      <th className="px-3 py-2 text-start font-semibold text-[var(--text-primary)]">
                        موقعیت
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {indexing.queries.map((q, i) => (
                      <tr key={i} className="border-b border-[var(--border-light)]">
                        <td className="px-3 py-2 text-[var(--text-primary)]">{q.query}</td>
                        <td className="px-3 py-2 text-[var(--text-primary)]">
                          {q.clicks.toLocaleString('fa-IR')}
                        </td>
                        <td className="px-3 py-2 text-[var(--text-primary)]">
                          {q.impressions.toLocaleString('fa-IR')}
                        </td>
                        <td className="px-3 py-2 text-[var(--text-primary)]">
                          {(q.ctr * 100).toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 text-[var(--text-primary)]">
                          {q.position.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">داده‌ای موجود نیست.</p>
          )}
        </Card>
      ) : null}

      {/* Sitemaps Tab */}
      {activeTab === 'sitemaps' && sitemaps?.ok ? (
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Sitemapها</h2>
          {sitemaps.sitemaps.length > 0 ? (
            <div className="space-y-3">
              {sitemaps.sitemaps.map((s, i) => (
                <div
                  key={i}
                  className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {s.path}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        s.isPending
                          ? 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]'
                          : 'bg-[var(--color-success)]/20 text-[var(--color-success)]'
                      }`}
                    >
                      {s.isPending ? 'در انتظار' : 'فعال'}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-[var(--text-muted)]">
                    <span>نوع: {s.type}</span>
                    <span>
                      ارسال:{' '}
                      {s.lastSubmitted
                        ? new Date(s.lastSubmitted).toLocaleDateString('fa-IR')
                        : '-'}
                    </span>
                    <span>
                      دریافت:{' '}
                      {s.lastDownloaded
                        ? new Date(s.lastDownloaded).toLocaleDateString('fa-IR')
                        : '-'}
                    </span>
                    <span>خطاها: {s.errors}</span>
                    <span>هشدارها: {s.warnings}</span>
                  </div>
                  {s.contents.length > 0 ? (
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      {s.contents.map((content, contentIndex) => (
                        <div
                          key={`${s.path}-${content.type}-${contentIndex}`}
                          className="rounded-[var(--radius-sm)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3"
                        >
                          <p className="text-xs text-[var(--text-muted)]">
                            نوع محتوا: {content.type || '-'}
                          </p>
                          <p className="mt-1 text-sm text-[var(--text-primary)]">
                            ثبت‌شده: {content.submitted.toLocaleString('fa-IR')}
                          </p>
                          <p className="text-sm text-[var(--text-primary)]">
                            ایندکس‌شده: {content.indexed.toLocaleString('fa-IR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {s.warnings > 0 ? (
                    <p className="mt-3 text-xs text-[var(--color-warning)]">
                      این sitemap هنوز هشدار دارد و باید بعد از deploy دوباره در Search Console
                      بررسی شود.
                    </p>
                  ) : null}
                  {s.errors > 0 ? (
                    <p className="mt-2 text-xs text-[var(--color-danger)]">
                      این sitemap خطا دارد و قبل از validation باید رفع شود.
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">Sitemapی یافت نشد.</p>
          )}
        </Card>
      ) : null}

      {activeTab === 'sitemaps' && sitemaps && !sitemaps.ok ? (
        <Card className="p-6">
          <p className="text-sm text-[var(--color-danger)]">{sitemaps.error ?? 'خطای نامشخص'}</p>
        </Card>
      ) : null}

      {/* Health Tab */}
      {activeTab === 'health' && (
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">اطلاعات اتصال</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
              <p className="text-xs text-[var(--text-muted)]">پروژه</p>
              <p className="mt-1 font-mono text-sm text-[var(--text-primary)]">persiantoolbox</p>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
              <p className="text-xs text-[var(--text-muted)]">سایت</p>
              <p className="mt-1 font-mono text-sm text-[var(--text-primary)]">persiantoolbox.ir</p>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4 md:col-span-2">
              <p className="text-xs text-[var(--text-muted)]">Propertyهای قابل استفاده</p>
              <div className="mt-2 space-y-1">
                {(health?.candidates ?? []).map((candidate) => (
                  <p key={candidate} className="font-mono text-xs text-[var(--text-primary)]">
                    {candidate}
                  </p>
                ))}
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4 md:col-span-2">
              <p className="text-xs text-[var(--text-muted)]">Property فعال</p>
              <p className="mt-1 font-mono text-sm text-[var(--text-primary)]">
                {health?.property ?? '-'}
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
              <p className="text-xs text-[var(--text-muted)]">Service Account</p>
              <p className="mt-1 font-mono text-sm text-[var(--text-primary)]">
                persiantoolbox-g-serv@...
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
              <p className="text-xs text-[var(--text-muted)]">وضعیت</p>
              <p
                className={`mt-1 text-sm font-semibold ${health?.connected ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}
              >
                {health?.connected ? 'متصل' : 'قطع'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
