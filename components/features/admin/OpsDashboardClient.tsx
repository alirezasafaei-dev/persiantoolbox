'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AsyncState, Card } from '@/components/ui';
import Button from '@/shared/ui/Button';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import type { OpsDashboardSnapshot } from '@/lib/admin/opsDashboard';
import { formatUptimeFa, formatDateFa } from '@/shared/utils/format';

type OpsDashboardState =
  | { status: 'loading'; snapshot: null; error: null; refreshing: boolean }
  | { status: 'ready'; snapshot: OpsDashboardSnapshot; error: null; refreshing: boolean }
  | { status: 'error'; snapshot: null; error: string; refreshing: boolean };

type SystemInfo = {
  cpu: { model: string; cores: number; usagePercent: number; loadAvg: number[] };
  memory: { totalMB: number; usedMB: number; freeMB: number; usagePercent: number };
  disk: { totalGB: number; usedGB: number; freeGB: number; usagePercent: number };
  node: { version: string; uptime: number; pid: number };
  os: { platform: string; arch: string; hostname: string; release: string };
};

type LogEntry = { timestamp: string; level: string; message: string; source: string };

type DBTable = {
  table_name: string;
  row_estimate: string;
  total_size: string;
  table_size: string;
  index_size: string;
};
type DBStats = { tables: DBTable[]; activeConnections: number; totalSize: string };

type PM2Process = {
  name: string;
  id: number;
  status: string;
  cpu: number;
  memoryMB: number;
  uptime: number;
  restarts: number;
  nodeVersion: string;
  mode: string;
};

type HealthRecord = {
  timestamp: string;
  status: string;
  responseTimeMs: number;
  details: Record<string, unknown>;
};

const POLL_INTERVAL_MS = 30_000;

const TABS = [
  { id: 'overview', label: 'نمای کلی' },
  { id: 'system', label: 'منابع سیستم' },
  { id: 'logs', label: 'لاگ‌ها' },
  { id: 'db', label: 'دیتابیس' },
  { id: 'cache', label: 'کش' },
  { id: 'processes', label: 'پروسه‌ها' },
  { id: 'env', label: 'متغیرها' },
  { id: 'health', label: 'سلامت' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function formatDateTime(value: string | null) {
  if (!value) {
    return 'ثبت نشده';
  }
  return formatDateFa(value);
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

function StatusPill({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        ok
          ? 'border border-green-200/40 bg-[rgba(16,185,129,0.12)] text-green-300'
          : 'border border-rose-200/40 bg-[rgba(239,68,68,0.12)] text-rose-300'
      }`}
    >
      {ok ? 'فعال' : 'غیرفعال'}
    </span>
  );
}

function ProgressBar({ percent, color }: { percent: number; color?: string }) {
  const barColor =
    percent > 80
      ? 'var(--color-danger)'
      : percent > 60
        ? 'var(--color-warning)'
        : (color ?? 'var(--color-success)');
  return (
    <div className="h-2 rounded-full bg-[var(--surface-2)]">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percent}%`, backgroundColor: barColor }}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card className="p-4">
      <div className="text-xs text-[var(--text-muted)]">{label}</div>
      <div className="mt-1 text-xl font-black text-[var(--text-primary)]">{value}</div>
      {sub && <div className="mt-1 text-[11px] text-[var(--text-muted)]">{sub}</div>}
    </Card>
  );
}

function ResourceBar({
  label,
  percent,
  detail,
}: {
  label: string;
  percent: number;
  detail: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="font-mono text-xs text-[var(--text-muted)]">{detail}</span>
      </div>
      <ProgressBar percent={percent} />
    </div>
  );
}

function FlagPill({ enabled }: { enabled: boolean }) {
  return <StatusPill ok={enabled} />;
}

export default function OpsDashboardClient() {
  const [state, setState] = useState<OpsDashboardState>({
    status: 'loading',
    snapshot: null,
    error: null,
    refreshing: false,
  });
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // System info
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [systemLoading, setSystemLoading] = useState(false);

  // Logs
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [logSources, setLogSources] = useState<string[]>([]);
  const [logFilter, setLogFilter] = useState({ level: 'ALL', source: 'all', limit: 100 });
  const [logsLoading, setLogsLoading] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // DB stats
  const [dbStats, setDbStats] = useState<DBStats | null>(null);
  const [dbLoading, setDbLoading] = useState(false);

  // Cache
  const [cacheInfo, setCacheInfo] = useState<{ nextCacheMB: number } | null>(null);
  const [cacheActionLoading, setCacheActionLoading] = useState(false);
  const [cacheMessage, setCacheMessage] = useState('');

  // Processes
  const [processes, setProcesses] = useState<PM2Process[]>([]);
  const [processLoading, setProcessLoading] = useState(false);
  const [processAction, setProcessAction] = useState<string | null>(null);

  // Env
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [envLoading, setEnvLoading] = useState(false);
  const [envSearch, setEnvSearch] = useState('');

  // Health history
  const [healthHistory, setHealthHistory] = useState<HealthRecord[]>([]);
  const [healthLoading, setHealthLoading] = useState(false);

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
        headers: { Accept: 'application/json' },
      });
      const payload = (await response.json()) as
        | { ok: true; snapshot: OpsDashboardSnapshot }
        | { ok: false; reason: string };
      if (!response.ok || payload.ok === false) {
        throw new Error(
          payload.ok === false ? payload.reason : 'اطلاعات پنل اپراتور قابل دریافت نیست.',
        );
      }
      setState({ status: 'ready', snapshot: payload.snapshot, error: null, refreshing: false });
    } catch (error) {
      setState({
        status: 'error',
        snapshot: null,
        error: error instanceof Error ? error.message : 'خطا در دریافت snapshot',
        refreshing: false,
      });
    }
  }, []);

  useEffect(() => {
    void loadSnapshot();
    const timer = window.setInterval(() => void loadSnapshot(true), POLL_INTERVAL_MS);
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
    return {
      topEvents,
      topPaths,
      totalEvents,
      enabledFeatures,
      totalFeatures,
      featureActivePercent: toPercent(enabledFeatures, totalFeatures),
      generatedLabel: formatDateTime(state.snapshot.generatedAt),
    };
  }, [state]);

  // Tab-specific data loaders
  const loadSystemInfo = useCallback(async () => {
    setSystemLoading(true);
    try {
      const res = await fetch('/api/admin/ops/system-info', { cache: 'no-store' });
      const data = (await res.json()) as { ok: boolean; system?: SystemInfo };
      if (data.ok && data.system) {
        setSystemInfo(data.system);
      }
    } catch {
      /* ignore */
    }
    setSystemLoading(false);
  }, []);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const params = new URLSearchParams({
        level: logFilter.level,
        source: logFilter.source,
        limit: String(logFilter.limit),
      });
      const res = await fetch(`/api/admin/ops/logs?${params}`, { cache: 'no-store' });
      const data = (await res.json()) as { ok: boolean; entries?: LogEntry[]; sources?: string[] };
      if (data.ok) {
        setLogEntries(data.entries ?? []);
        if (data.sources) {
          setLogSources(data.sources);
        }
      }
    } catch {
      /* ignore */
    }
    setLogsLoading(false);
  }, [logFilter]);

  const loadDBStats = useCallback(async () => {
    setDbLoading(true);
    try {
      const res = await fetch('/api/admin/ops/actions?section=db', { cache: 'no-store' });
      const data = (await res.json()) as { ok: boolean; data?: { db?: DBStats } };
      if (data.ok && data.data?.db) {
        setDbStats(data.data.db);
      }
    } catch {
      /* ignore */
    }
    setDbLoading(false);
  }, []);

  const loadCache = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/ops/actions?section=cache', { cache: 'no-store' });
      const data = (await res.json()) as {
        ok: boolean;
        data?: { cache?: { nextCacheMB: number } };
      };
      if (data.ok && data.data?.cache) {
        setCacheInfo(data.data.cache);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const loadProcesses = useCallback(async () => {
    setProcessLoading(true);
    try {
      const res = await fetch('/api/admin/ops/actions?section=processes', { cache: 'no-store' });
      const data = (await res.json()) as { ok: boolean; data?: { processes?: PM2Process[] } };
      if (data.ok && data.data?.processes) {
        setProcesses(data.data.processes);
      }
    } catch {
      /* ignore */
    }
    setProcessLoading(false);
  }, []);

  const loadEnvVars = useCallback(async () => {
    setEnvLoading(true);
    try {
      const res = await fetch('/api/admin/ops/actions?section=env', { cache: 'no-store' });
      const data = (await res.json()) as { ok: boolean; data?: { env?: Record<string, string> } };
      if (data.ok && data.data?.env) {
        setEnvVars(data.data.env);
      }
    } catch {
      /* ignore */
    }
    setEnvLoading(false);
  }, []);

  const loadHealthHistory = useCallback(async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/admin/ops/health-history?limit=50', { cache: 'no-store' });
      const data = (await res.json()) as {
        ok: boolean;
        history?: Array<{
          checked_at: string;
          status: string;
          response_time_ms: number;
          details: Record<string, unknown>;
        }>;
      };
      if (data.ok && data.history) {
        setHealthHistory(
          data.history.map((h) => ({
            timestamp: h.checked_at,
            status: h.status,
            responseTimeMs: h.response_time_ms,
            details: h.details,
          })),
        );
      }
    } catch {
      /* ignore */
    }
    setHealthLoading(false);
  }, []);

  const handleTabChange = useCallback(
    (tab: TabId) => {
      setActiveTab(tab);
      if (tab === 'system' && !systemInfo) {
        void loadSystemInfo();
      }
      if (tab === 'logs' && logEntries.length === 0) {
        void loadLogs();
      }
      if (tab === 'db' && !dbStats) {
        void loadDBStats();
      }
      if (tab === 'cache' && !cacheInfo) {
        void loadCache();
      }
      if (tab === 'processes' && processes.length === 0) {
        void loadProcesses();
      }
      if (tab === 'env' && Object.keys(envVars).length === 0) {
        void loadEnvVars();
      }
      if (tab === 'health' && healthHistory.length === 0) {
        void loadHealthHistory();
      }
    },
    [
      systemInfo,
      logEntries.length,
      dbStats,
      cacheInfo,
      processes.length,
      envVars,
      healthHistory.length,
      loadSystemInfo,
      loadLogs,
      loadDBStats,
      loadCache,
      loadProcesses,
      loadEnvVars,
      loadHealthHistory,
    ],
  );

  const handleClearCache = useCallback(async () => {
    setCacheActionLoading(true);
    setCacheMessage('');
    try {
      const res = await fetch('/api/admin/ops/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear-cache' }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        data?: { message: string };
        reason?: string;
      };
      setCacheMessage(data.ok ? (data.data?.message ?? 'انجام شد') : (data.reason ?? 'خطا'));
      if (data.ok) {
        setCacheInfo({ nextCacheMB: 0 });
      }
    } catch {
      setCacheMessage('خطا در ارتباط');
    }
    setCacheActionLoading(false);
  }, []);

  const handlePM2Action = useCallback(
    async (processName: string, action: string) => {
      setProcessAction(`${processName}:${action}`);
      try {
        await fetch('/api/admin/ops/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'pm2-action', target: `${action} ${processName}` }),
        });
        await new Promise((r) => setTimeout(r, 2000));
        void loadProcesses();
      } catch {
        /* ignore */
      }
      setProcessAction(null);
    },
    [loadProcesses],
  );

  const handleRunHealthCheck = useCallback(async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/admin/ops/health-history?check=true&limit=50', {
        cache: 'no-store',
      });
      const data = (await res.json()) as {
        ok: boolean;
        history?: Array<{
          checked_at: string;
          status: string;
          response_time_ms: number;
          details: Record<string, unknown>;
        }>;
        currentCheck?: HealthRecord;
      };
      if (data.ok && data.history) {
        setHealthHistory(
          data.history.map((h) => ({
            timestamp: h.checked_at,
            status: h.status,
            responseTimeMs: h.response_time_ms,
            details: h.details,
          })),
        );
      }
    } catch {
      /* ignore */
    }
    setHealthLoading(false);
  }, []);

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

  const snap = state.snapshot;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="section-surface p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
              Production Ops Dashboard
            </div>
            <h1 className="text-3xl font-black text-[var(--text-primary)]">داشبورد اپراتوری</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              مدیریت و پایش سرویس، پروسه‌ها، دیتابیس و منابع سیستم
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              آخرین آپدیت: {summary.generatedLabel}
            </p>
          </div>
          <Button type="button" onClick={() => void loadSnapshot(true)} disabled={state.refreshing}>
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
      </section>

      {/* Tabs */}
      <div
        className="flex flex-wrap gap-1 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-1"
        role="tablist"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========== OVERVIEW TAB ========== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Row */}
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard
              label="نسخه اجرا"
              value={`v${snap.runtime.version}`}
              sub={snap.runtime.commit ?? 'سرویس: persiantoolbox'}
            />
            <MetricCard
              label="رویدادهای تجمیعی"
              value={summary.totalEvents.toLocaleString('fa-IR')}
            />
            <Card className="p-5">
              <div className="text-xs text-[var(--text-muted)]">وابستگی‌ها</div>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>DB</span>
                  <span>
                    {healthStateText(
                      snap.dependencies.database.ok,
                      snap.dependencies.database.reason,
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Health</span>
                  <span>
                    {healthStateText(
                      snap.serviceHealth.health.ok,
                      snap.serviceHealth.health.reason,
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ready</span>
                  <span>
                    {healthStateText(snap.serviceHealth.ready.ok, snap.serviceHealth.ready.reason)}
                  </span>
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <div className="text-xs text-[var(--text-muted)]">فیچرهای فعال</div>
              <div className="mt-1 text-lg font-black text-[var(--text-primary)]">
                {summary.enabledFeatures}/{summary.totalFeatures}
              </div>
              <div className="mt-2">
                <ProgressBar percent={summary.featureActivePercent} />
              </div>
            </Card>
          </section>

          {/* Top Events / Paths */}
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

          {/* Feature Flags */}
          <Card className="p-6 space-y-3">
            <h2 className="text-lg font-black text-[var(--text-primary)]">Feature Flag وضعیت</h2>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {snap.featureFlags.map((item) => (
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

          {/* Site Settings */}
          <Card className="p-6 space-y-2">
            <h2 className="text-lg font-black text-[var(--text-primary)]">تنظیمات سایت</h2>
            {snap.siteSettings.ok ? (
              <dl className="grid gap-2 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-[var(--text-muted)]">نام تیم</dt>
                  <dd className="font-semibold text-[var(--text-primary)]">
                    {snap.siteSettings.summary?.developerName}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">نسخه برند</dt>
                  <dd className="font-semibold text-[var(--text-primary)]">
                    {snap.siteSettings.summary?.developerBrandText}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">Order URL</dt>
                  <dd className="font-mono text-[var(--text-primary)]">
                    {snap.siteSettings.summary?.orderUrl ?? 'تنظیم نشده'}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">Portfolio URL</dt>
                  <dd className="font-mono text-[var(--text-primary)]">
                    {snap.siteSettings.summary?.portfolioUrl ?? 'تنظیم نشده'}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-[var(--color-danger)]">
                {snap.siteSettings.reason ?? 'بارگذاری تنظیمات ناموفق بود.'}
              </p>
            )}
          </Card>
        </div>
      )}

      {/* ========== SYSTEM RESOURCES TAB ========== */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[var(--text-primary)]">منابع سیستم</h2>
            <Button
              type="button"
              onClick={() => void loadSystemInfo()}
              disabled={systemLoading}
              variant="secondary"
            >
              {systemLoading ? <LoadingSpinner size="sm" /> : 'بروزرسانی'}
            </Button>
          </div>

          {systemLoading && !systemInfo && (
            <div className="grid min-h-[200px] place-items-center">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {systemInfo && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <MetricCard
                  label="负载 average"
                  value={systemInfo.cpu.loadAvg.join(' / ')}
                  sub={`${systemInfo.cpu.cores} هسته`}
                />
                <MetricCard
                  label="مصرف CPU"
                  value={`${systemInfo.cpu.usagePercent}%`}
                  sub={systemInfo.cpu.model}
                />
                <MetricCard
                  label="حافظه"
                  value={`${systemInfo.memory.usagePercent}%`}
                  sub={`${systemInfo.memory.usedMB} / ${systemInfo.memory.totalMB} MB`}
                />
                <MetricCard
                  label="دیسک"
                  value={`${systemInfo.disk.usagePercent}%`}
                  sub={`${systemInfo.disk.usedGB} / ${systemInfo.disk.totalGB} GB`}
                />
              </div>

              <Card className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">مصرف منابع</h3>
                <ResourceBar
                  label="CPU"
                  percent={systemInfo.cpu.usagePercent}
                  detail={`${systemInfo.cpu.usagePercent}% — ${systemInfo.cpu.cores} هسته`}
                />
                <ResourceBar
                  label="حافظه RAM"
                  percent={systemInfo.memory.usagePercent}
                  detail={`${systemInfo.memory.usedMB} / ${systemInfo.memory.totalMB} MB`}
                />
                <ResourceBar
                  label="دیسک"
                  percent={systemInfo.disk.usagePercent}
                  detail={`${systemInfo.disk.usedGB} / ${systemInfo.disk.totalGB} GB`}
                />
              </Card>

              <Card className="p-6 space-y-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">اطلاعات سیستم‌عامل</h3>
                <dl className="grid gap-2 text-sm md:grid-cols-2">
                  <div>
                    <dt className="text-[var(--text-muted)]">پلتفرم</dt>
                    <dd className="font-mono text-[var(--text-primary)]">
                      {systemInfo.os.platform}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">معماری</dt>
                    <dd className="font-mono text-[var(--text-primary)]">{systemInfo.os.arch}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">هاست‌نیم</dt>
                    <dd className="font-mono text-[var(--text-primary)]">
                      {systemInfo.os.hostname}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">نسخه Node.js</dt>
                    <dd className="font-mono text-[var(--text-primary)]">
                      {systemInfo.node.version}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">زمان اجرا</dt>
                    <dd className="text-[var(--text-primary)]">
                      {formatUptimeFa(systemInfo.node.uptime)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">PID</dt>
                    <dd className="font-mono text-[var(--text-primary)]">{systemInfo.node.pid}</dd>
                  </div>
                </dl>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ========== LOGS TAB ========== */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-[var(--text-primary)]">لاگ‌های سرور</h2>
            <Button
              type="button"
              onClick={() => void loadLogs()}
              disabled={logsLoading}
              variant="secondary"
            >
              {logsLoading ? <LoadingSpinner size="sm" /> : 'بروزرسانی'}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={logFilter.level}
              onChange={(e) => setLogFilter((p) => ({ ...p, level: e.target.value }))}
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1.5 text-xs text-[var(--text-primary)]"
              aria-label="فیلتر سطح"
            >
              {['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG'].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <select
              value={logFilter.source}
              onChange={(e) => setLogFilter((p) => ({ ...p, source: e.target.value }))}
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1.5 text-xs text-[var(--text-primary)]"
              aria-label="فیلتر منبع"
            >
              <option value="all">همه منابع</option>
              {logSources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={10}
              max={500}
              value={logFilter.limit}
              onChange={(e) =>
                setLogFilter((p) => ({ ...p, limit: Number(e.target.value) || 100 }))
              }
              className="w-20 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1.5 text-xs text-[var(--text-primary)]"
              aria-label="تعداد"
            />
          </div>

          <div
            ref={logsContainerRef}
            className="max-h-[500px] overflow-auto rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 font-mono text-xs leading-relaxed"
          >
            {logsLoading && logEntries.length === 0 ? (
              <div className="grid min-h-[100px] place-items-center">
                <LoadingSpinner size="md" />
              </div>
            ) : logEntries.length === 0 ? (
              <p className="text-center text-[var(--text-muted)]">لاگی یافت نشد.</p>
            ) : (
              logEntries.map((entry, i) => (
                <div
                  key={i}
                  className="flex gap-3 border-b border-[var(--border-light)] py-1 last:border-0"
                >
                  <span className="shrink-0 text-[var(--text-muted)]">{entry.timestamp}</span>
                  <span
                    className={`shrink-0 font-bold ${
                      entry.level === 'ERROR'
                        ? 'text-[var(--color-danger)]'
                        : entry.level === 'WARN'
                          ? 'text-[var(--color-warning)]'
                          : 'text-[var(--color-success)]'
                    }`}
                  >
                    {entry.level}
                  </span>
                  <span className="shrink-0 text-[var(--text-muted)]">[{entry.source}]</span>
                  <span className="text-[var(--text-secondary)] break-all">{entry.message}</span>
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)]">{logEntries.length} لاگ نمایش داده شد</p>
        </div>
      )}

      {/* ========== DATABASE TAB ========== */}
      {activeTab === 'db' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[var(--text-primary)]">آمار دیتابیس</h2>
            <Button
              type="button"
              onClick={() => void loadDBStats()}
              disabled={dbLoading}
              variant="secondary"
            >
              {dbLoading ? <LoadingSpinner size="sm" /> : 'بروزرسانی'}
            </Button>
          </div>

          {dbLoading && !dbStats && (
            <div className="grid min-h-[200px] place-items-center">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {dbStats && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard label="حجم کل دیتابیس" value={dbStats.totalSize} />
                <MetricCard label="اتصالات فعال" value={dbStats.activeConnections} />
                <MetricCard label="تعداد جداول" value={dbStats.tables.length} />
              </div>

              <Card className="p-6">
                <h3 className="mb-4 text-sm font-bold text-[var(--text-primary)]">جداول</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-light)] text-right text-xs text-[var(--text-muted)]">
                        <th className="px-3 py-2">نام جدول</th>
                        <th className="px-3 py-2">تقریب ردیف</th>
                        <th className="px-3 py-2">حجم کل</th>
                        <th className="px-3 py-2">حجم جدول</th>
                        <th className="px-3 py-2">حجم ایندکس</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbStats.tables.map((t) => (
                        <tr
                          key={t.table_name}
                          className="border-b border-[var(--border-light)] last:border-0"
                        >
                          <td className="px-3 py-2 font-mono font-semibold text-[var(--text-primary)]">
                            {t.table_name}
                          </td>
                          <td className="px-3 py-2 text-[var(--text-secondary)]">
                            {Number(t.row_estimate).toLocaleString('fa-IR')}
                          </td>
                          <td className="px-3 py-2 text-[var(--text-secondary)]">{t.total_size}</td>
                          <td className="px-3 py-2 text-[var(--text-secondary)]">{t.table_size}</td>
                          <td className="px-3 py-2 text-[var(--text-secondary)]">{t.index_size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ========== CACHE TAB ========== */}
      {activeTab === 'cache' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[var(--text-primary)]">مدیریت کش</h2>
            <Button type="button" onClick={() => void loadCache()} variant="secondary">
              بروزرسانی
            </Button>
          </div>

          <Card className="p-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <MetricCard
                label="حجم کش Next.js"
                value={cacheInfo ? `${cacheInfo.nextCacheMB} MB` : '—'}
                sub=".next/cache"
              />
              <Card className="p-4">
                <div className="text-xs text-[var(--text-muted)]">عملیات کش</div>
                <div className="mt-3 space-y-2">
                  <Button
                    type="button"
                    onClick={() => void handleClearCache()}
                    disabled={cacheActionLoading}
                    variant="danger"
                  >
                    {cacheActionLoading ? <LoadingSpinner size="sm" /> : 'پاکسازی کش'}
                  </Button>
                  {cacheMessage && (
                    <p
                      className={`text-xs ${cacheMessage.includes('خطا') ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}
                    >
                      {cacheMessage}
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </Card>
        </div>
      )}

      {/* ========== PROCESSES TAB ========== */}
      {activeTab === 'processes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[var(--text-primary)]">مدیریت پروسه‌ها (PM2)</h2>
            <Button
              type="button"
              onClick={() => void loadProcesses()}
              disabled={processLoading}
              variant="secondary"
            >
              {processLoading ? <LoadingSpinner size="sm" /> : 'بروزرسانی'}
            </Button>
          </div>

          {processLoading && processes.length === 0 && (
            <div className="grid min-h-[200px] place-items-center">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {processes.length === 0 && !processLoading ? (
            <Card className="p-6">
              <p className="text-sm text-[var(--text-muted)]">پروسه‌ای یافت نشد.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {processes.map((proc) => (
                <Card key={proc.name} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)]">{proc.name}</span>
                        <StatusPill ok={proc.status === 'online'} />
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
                        <span>CPU: {proc.cpu}%</span>
                        <span>RAM: {proc.memoryMB} MB</span>
                        <span>ری‌استارت: {proc.restarts}</span>
                        <span>Node: {proc.nodeVersion}</span>
                        <span>حالت: {proc.mode}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => void handlePM2Action(proc.name, 'restart')}
                        disabled={processAction === `${proc.name}:restart`}
                        className="rounded bg-[var(--color-primary)]/10 px-2 py-1 text-[11px] font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 disabled:opacity-50"
                      >
                        ری‌استارت
                      </button>
                      <button
                        onClick={() => void handlePM2Action(proc.name, 'stop')}
                        disabled={processAction === `${proc.name}:stop`}
                        className="rounded bg-[var(--color-warning)]/10 px-2 py-1 text-[11px] font-semibold text-[var(--color-warning)] hover:bg-[var(--color-warning)]/20 disabled:opacity-50"
                      >
                        توقف
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== ENV TAB ========== */}
      {activeTab === 'env' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-[var(--text-primary)]">متغیرهای محیطی</h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="جستجو..."
                value={envSearch}
                onChange={(e) => setEnvSearch(e.target.value)}
                className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1.5 text-xs text-[var(--text-primary)]"
                aria-label="جستجوی متغیر"
              />
              <Button
                type="button"
                onClick={() => void loadEnvVars()}
                disabled={envLoading}
                variant="secondary"
              >
                {envLoading ? <LoadingSpinner size="sm" /> : 'بروزرسانی'}
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <p className="mb-3 text-xs text-[var(--text-muted)]">
              فقط متغیرهای غیرحساس نمایش داده می‌شوند. متغیرهای حساس (password, secret, token, ...)
              مخفی شده‌اند.
            </p>
            <div className="max-h-[500px] overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-light)] text-right text-xs text-[var(--text-muted)]">
                    <th className="px-3 py-2">نام</th>
                    <th className="px-3 py-2">مقدار</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(envVars)
                    .filter(
                      ([k]) =>
                        envSearch === '' || k.toLowerCase().includes(envSearch.toLowerCase()),
                    )
                    .map(([k, v]) => (
                      <tr key={k} className="border-b border-[var(--border-light)] last:border-0">
                        <td className="px-3 py-2 font-mono font-semibold text-[var(--text-primary)]">
                          {k}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs break-all text-[var(--text-secondary)]">
                          {v}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-[var(--text-muted)]">
              {Object.keys(envVars).length} متغیر نمایش داده شد
            </p>
          </Card>
        </div>
      )}

      {/* ========== HEALTH HISTORY TAB ========== */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[var(--text-primary)]">تاریخچه سلامت</h2>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => void handleRunHealthCheck()}
                disabled={healthLoading}
                variant="secondary"
              >
                {healthLoading ? <LoadingSpinner size="sm" /> : 'بررسی جدید'}
              </Button>
              <Button
                type="button"
                onClick={() => void loadHealthHistory()}
                disabled={healthLoading}
                variant="secondary"
              >
                بروزرسانی
              </Button>
            </div>
          </div>

          {healthLoading && healthHistory.length === 0 && (
            <div className="grid min-h-[200px] place-items-center">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {healthHistory.length === 0 && !healthLoading ? (
            <Card className="p-6">
              <p className="text-sm text-[var(--text-muted)]">
                تاریخچه‌ای موجود نیست. روی «بررسی جدید» کلیک کنید.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {healthHistory.map((h, i) => (
                <Card key={i} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-3 w-3 rounded-full ${h.status === 'ok' ? 'bg-[var(--color-success)]' : h.status === 'degraded' ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-danger)]'}`}
                      />
                      <div>
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          {formatDateTime(h.timestamp)}
                        </span>
                        <span className="ms-2 text-xs text-[var(--text-muted)]">
                          {h.responseTimeMs}ms
                        </span>
                      </div>
                    </div>
                    <StatusPill ok={h.status === 'ok'} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
