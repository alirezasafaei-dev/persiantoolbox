'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AsyncState, Card } from '@/components/ui';
import Button from '@/shared/ui/Button';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import type { OpsDashboardSnapshot } from '@/lib/admin/opsDashboard';

type OpsDashboardState =
  | { status: 'loading'; snapshot: null; error: null; refreshing: boolean }
  | { status: 'ready'; snapshot: OpsDashboardSnapshot; error: null; refreshing: boolean }
  | { status: 'error'; snapshot: null; error: string; refreshing: boolean };

const POLL_INTERVAL_MS = 30_000;

function formatDateTime(value: string | null) {
  if (!value) {
    return 'ثبت نشده';
  }
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function healthStateText(ok: boolean, reason?: string) {
  return ok ? 'سالم' : `مشکل (${reason ?? 'نامشخص'})`;
}

function toPercent(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, (value / total) * 100));
}

function FlagPill({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        enabled
          ? 'border border-green-200/40 bg-[rgba(16,185,129,0.12)] text-green-300'
          : 'border border-rose-200/40 bg-[rgba(239,68,68,0.12)] text-rose-300'
      }`}
    >
      {enabled ? 'فعالی' : 'غیرفعال'}
    </span>
  );
}

export default function OpsDashboardClient() {
  const [state, setState] = useState<OpsDashboardState>({
    status: 'loading',
    snapshot: null,
    error: null,
    refreshing: false,
  });

  const loadSnapshot = useCallback(async (isRefresh = false) => {
    setState((current) => {
      if (current.status === 'loading' && !isRefresh) {
        return current;
      }
      return { ...current, refreshing: true };
    });

    try {
      const response = await fetch('/api/admin/ops', {
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
        },
      });

      const payload = (await response.json()) as
        | { ok: true; snapshot: OpsDashboardSnapshot }
        | { ok: false; reason: string };

      if (!response.ok || payload.ok === false) {
        const reason =
          payload.ok === false ? payload.reason : 'اطلاعات پنل اپراتور قابل دریافت نبود.';
        throw new Error(reason);
      }

      setState({
        status: 'ready',
        snapshot: payload.snapshot,
        error: null,
        refreshing: false,
      });
    } catch (error) {
      setState({
        status: 'error',
        snapshot: null,
        error: error instanceof Error ? error.message : 'درخواست snapshot ناموفق بود.',
        refreshing: false,
      });
    }
  }, []);

  useEffect(() => {
    void loadSnapshot();
    const timer = window.setInterval(() => {
      void loadSnapshot(true);
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [loadSnapshot]);

  const summary = useMemo(() => {
    if (state.status !== 'ready') {
      return null;
    }

    const topEvents = state.snapshot.analytics.summary?.topEvents ?? [];
    const topPaths = state.snapshot.analytics.summary?.topPaths ?? [];
    const totalEvents = state.snapshot.analytics.summary?.totalEvents ?? 0;

    const enabledFeatures = state.snapshot.featureFlags.filter((item) => item.enabled).length;
    const totalFeatures = state.snapshot.featureFlags.length;
    const featureActivePercent = toPercent(enabledFeatures, totalFeatures);

    return {
      topEvents,
      topPaths,
      totalEvents,
      enabledFeatures,
      totalFeatures,
      featureActivePercent,
      generatedLabel: formatDateTime(state.snapshot.generatedAt),
      lastUpdated:
        formatDateTime(
          state.snapshot.analytics.summary?.lastUpdated
            ? new Date(state.snapshot.analytics.summary.lastUpdated).toISOString()
            : null,
        ) ?? 'ثبت نشده',
    };
  }, [state]);

  if (state.status === 'loading') {
    return (
      <div className="grid min-h-[360px] place-items-center">
        <AsyncState
          variant="loading"
          title="در حال جمع‌آوری وضعیت"
          description="برای اولین بار، وضعیت عملیاتی و گزارش جمع‌آوری می‌شود..."
        />
      </div>
    );
  }

  if (state.status === 'error' || !state.snapshot || !summary) {
    return (
      <div className="space-y-4">
        <AsyncState
          variant="error"
          title="دسترسی یا خطای سرویس"
          description={state.error ?? 'وضعیت داشبورد قابل نمایش نیست.'}
        />
        <Button type="button" onClick={() => void loadSnapshot()}>
          تلاش مجدد
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="section-surface p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
              Production Ops Dashboard
            </div>
            <h1 className="text-3xl font-black text-[var(--text-primary)]">داشبورد اپراتوری</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              وضعیت لحظه‌ای سرویس، feature flagها، سلامت وابستگی‌ها و خلاصهٔ تحلیل رفتار
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              آخرین آپدیت: {summary.generatedLabel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => void loadSnapshot(true)}
              disabled={state.refreshing}
            >
              {state.refreshing ? (
                <>
                  <LoadingSpinner className="ms-1 inline-block" size="sm" />
                  <span className="ms-2">بارگذاری</span>
                </>
              ) : (
                'بروزرسانی'
              )}
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <div className="text-xs text-[var(--text-muted)]">نسخه اجرا</div>
          <div className="mt-1 text-xl font-black text-[var(--text-primary)]">
            v{state.snapshot.runtime.version}
            {state.snapshot.runtime.commit ? ` · ${state.snapshot.runtime.commit}` : ''}
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)]">سرویس: persiantoolbox</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-[var(--text-muted)]">رویدادهای تجمیعی</div>
          <div className="mt-1 text-2xl font-black text-[var(--text-primary)]">
            {summary.totalEvents.toLocaleString('fa-IR')}
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)]">
            آخرین آپدیت: {summary.lastUpdated}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-[var(--text-muted)]">وابستگی‌ها</div>
          <div className="mt-2 space-y-1 text-sm">
            <div>
              DB:{' '}
              {healthStateText(
                state.snapshot.dependencies.database.ok,
                state.snapshot.dependencies.database.reason,
              )}
            </div>
            <div>
              Health route:{' '}
              {healthStateText(
                state.snapshot.serviceHealth.health.ok,
                state.snapshot.serviceHealth.health.reason,
              )}
            </div>
            <div>
              Ready gate:{' '}
              {healthStateText(
                state.snapshot.serviceHealth.ready.ok,
                state.snapshot.serviceHealth.ready.reason,
              )}
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-[var(--text-muted)]">فیچرهای فعال</div>
          <div className="mt-2 text-lg font-black text-[var(--text-primary)]">
            {summary.enabledFeatures}/{summary.totalFeatures}
          </div>
          <div className="mt-2 h-2 rounded-full bg-[var(--surface-2)]">
            <div
              className="h-full rounded-full bg-[var(--color-success)] transition-all duration-[var(--motion-medium)]"
              style={{ width: `${summary.featureActivePercent}%` }}
            />
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6 space-y-3">
          <h2 className="text-lg font-black text-[var(--text-primary)]">برترین رویدادها</h2>
          <div className="space-y-2">
            {summary.topEvents.length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">داده‌ای موجود نیست.</p>
            )}
            {summary.topEvents.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-[var(--text-secondary)]">{name}</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {count.toLocaleString('fa-IR')}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-3">
          <h2 className="text-lg font-black text-[var(--text-primary)]">برترین مسیرها</h2>
          <div className="space-y-2">
            {summary.topPaths.length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">داده‌ای موجود نیست.</p>
            )}
            {summary.topPaths.map(([path, count]) => (
              <div key={path} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-[var(--text-secondary)]">{path}</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {count.toLocaleString('fa-IR')}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4">
        <Card className="p-6 space-y-3">
          <h2 className="text-lg font-black text-[var(--text-primary)]">Feature Flag وضعیت</h2>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {state.snapshot.featureFlags.map((item) => (
              <article
                key={item.id}
                className="rounded-[var(--radius-md)] border border-[var(--border-light)] p-3"
              >
                <div className="text-xs text-[var(--text-muted)]">{item.id}</div>
                <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                  {item.title}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)]">{item.envKey}</span>
                  <FlagPill enabled={item.enabled} />
                </div>
              </article>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-2">
          <h2 className="text-lg font-black text-[var(--text-primary)]">خلاصه تنظیمات سایت</h2>
          {state.snapshot.siteSettings.ok ? (
            <dl className="grid gap-2 text-sm md:grid-cols-2">
              <div>
                <dt className="text-[var(--text-muted)]">نام تیم/سازنده</dt>
                <dd className="font-semibold text-[var(--text-primary)]">
                  {state.snapshot.siteSettings.summary?.developerName}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">نسخه پیام برند</dt>
                <dd className="font-semibold text-[var(--text-primary)]">
                  {state.snapshot.siteSettings.summary?.developerBrandText}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">Order URL</dt>
                <dd className="font-mono text-[var(--text-primary)]">
                  {state.snapshot.siteSettings.summary?.orderUrl ?? 'تنظیم نشده'}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">Portfolio URL</dt>
                <dd className="font-mono text-[var(--text-primary)]">
                  {state.snapshot.siteSettings.summary?.portfolioUrl ?? 'تنظیم نشده'}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-[var(--color-danger)]">
              {state.snapshot.siteSettings.reason ?? 'بارگذاری تنظیمات ناموفق بود.'}
            </p>
          )}
        </Card>
      </section>
    </div>
  );
}
