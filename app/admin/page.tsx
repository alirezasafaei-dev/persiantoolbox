'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import StatCard from '@/shared/ui/StatCard';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import BarChart from '@/shared/ui/charts/BarChart';
import type { BarChartData } from '@/shared/ui/charts/BarChart';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';

type AuditEntry = {
  id: string;
  timestamp: string;
  action: string;
  user_name: string;
  details: string;
};

type OpsSnapshot = {
  runtime: { version: string; uptime: string; memoryMB: number };
  dependencies: { database: { ok: boolean; reason?: string } };
  serviceHealth: { health: { ok: boolean }; ready: { ok: boolean } };
};

type AnalyticsSummary = {
  totalEvents: number;
  topPaths: Array<{ path: string; views: number }>;
  dailyViews: Array<{ date: string; views: number }>;
};

const ACTION_LABELS: Record<string, string> = {
  login: 'ورود',
  logout: 'خروج',
  settings_change: 'تغییر تنظیمات',
  tool_toggle: 'تغییر وضعیت ابزار',
  user_update: 'بروزرسانی کاربر',
  content_update: 'بروزرسانی محتوا',
  system_action: 'عملیات سیستم',
  other: 'سایر',
};

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) {
    parts.push(`${d} روز`);
  }
  if (h > 0) {
    parts.push(`${h} ساعت`);
  }
  parts.push(`${m} دقیقه`);
  return parts.join(' ');
}

export default function AdminDashboardPage() {
  const [ops, setOps] = useState<OpsSnapshot | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [opsRes, analyticsRes, auditRes] = await Promise.all([
        fetch('/api/admin/ops').then((r) => r.json()),
        fetch('/api/admin/analytics?range=7d')
          .then((r) => r.json())
          .catch(() => null),
        fetch('/api/admin/audit?limit=10')
          .then((r) => r.json())
          .catch(() => null),
      ]);

      if (opsRes?.ok) {
        setOps(opsRes.snapshot);
      }
      if (analyticsRes?.totalEvents !== undefined) {
        setAnalytics(analyticsRes);
      }
      if (auditRes?.ok) {
        setAuditEntries(auditRes.entries ?? []);
      }
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleQuickAction = async (action: string) => {
    setActionLoading(action);
    try {
      const endpoints: Record<string, { url: string; method: string }> = {
        clearCache: { url: '/api/admin/ops/clear-cache', method: 'POST' },
        exportData: { url: '/api/admin/analytics?range=30d', method: 'GET' },
        sendTestEmail: { url: '/api/admin/ops/test-email', method: 'POST' },
      };
      const ep = endpoints[action];
      if (!ep) {
        return;
      }

      const res = await fetch(ep.url, { method: ep.method });
      if (action === 'exportData' && res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // silently handle
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const dbOk = ops?.dependencies.database.ok ?? false;
  const healthOk = ops?.serviceHealth.health.ok ?? false;
  const readyOk = ops?.serviceHealth.ready.ok ?? false;
  const memoryMB = ops?.runtime.memoryMB ?? 0;
  const uptime = Number(ops?.runtime.uptime ?? '0');

  const dailyChartData: BarChartData[] = (analytics?.dailyViews ?? [])
    .slice(0, 7)
    .reverse()
    .map((d) => ({ label: d.date, value: d.views }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">داشبورد مدیریت</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            بروزرسانی خودکار هر ۳۰ ثانیه • آخرین بروزرسانی:{' '}
            {lastRefresh.toLocaleTimeString('fa-IR')}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchData}>
          🔄 بروزرسانی دستی
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="بازدید ۷ روز اخیر"
          value={analytics?.totalEvents?.toLocaleString('fa-IR') ?? '۰'}
          description="کل بازدیدها"
        />
        <StatCard title="حافظه مصرفی" value={`${memoryMB} MB`} description="مصرف RAM سرور" />
        <StatCard
          title="زمان فعالیت"
          value={formatUptime(uptime)}
          description="از آخرین ری‌استارت"
        />
        <StatCard title="ابزارهای فعال" value="۵۵" description="در ۶ دسته‌بندی" />
      </div>

      {/* System Health + Daily Chart Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Health */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">وضعیت سلامت سیستم</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--surface-2)] px-4 py-3">
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${healthOk ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'}`}
                />
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">سرور اصلی</p>
                  <p className="text-xs text-[var(--text-muted)]">سلامت کلی سرویس</p>
                </div>
              </div>
              <span
                className={`text-xs font-semibold ${healthOk ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}
              >
                {healthOk ? 'فعال' : 'مشکل'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--surface-2)] px-4 py-3">
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${dbOk ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'}`}
                />
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">دیتابیس</p>
                  <p className="text-xs text-[var(--text-muted)]">PostgreSQL</p>
                </div>
              </div>
              <span
                className={`text-xs font-semibold ${dbOk ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}
              >
                {dbOk ? 'متصل' : 'قطع'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--surface-2)] px-4 py-3">
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${readyOk ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]'}`}
                />
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">آماده‌سازی</p>
                  <p className="text-xs text-[var(--text-muted)]">وضعیت Readiness</p>
                </div>
              </div>
              <span
                className={`text-xs font-semibold ${readyOk ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}
              >
                {readyOk ? 'آماده' : 'در حال بررسی'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--surface-2)] px-4 py-3">
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${memoryMB < 512 ? 'bg-[var(--color-success)]' : memoryMB < 1024 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-danger)]'}`}
                />
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">حافظه</p>
                  <p className="text-xs text-[var(--text-muted)]">{memoryMB} MB مصرف شده</p>
                </div>
              </div>
              <span
                className={`text-xs font-semibold ${memoryMB < 512 ? 'text-[var(--color-success)]' : memoryMB < 1024 ? 'text-[var(--color-warning)]' : 'text-[var(--color-danger)]'}`}
              >
                {memoryMB < 512 ? 'عادی' : memoryMB < 1024 ? 'بالا' : 'بحرانی'}
              </span>
            </div>
          </div>
        </Card>

        {/* Daily Active Users Chart */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
            بازدید روزانه — ۷ روز اخیر
          </h2>
          {dailyChartData.length > 0 ? (
            <BarChart data={dailyChartData} height={180} color="var(--color-primary)" />
          ) : (
            <div className="flex h-[180px] items-center justify-center text-sm text-[var(--text-muted)]">
              داده‌ای موجود نیست
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">عملیات سریع</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => handleQuickAction('clearCache')}
            isLoading={actionLoading === 'clearCache'}
          >
            🗑️ پاکسازی کش
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => handleQuickAction('exportData')}
            isLoading={actionLoading === 'exportData'}
          >
            📦 خروجی داده‌ها
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => handleQuickAction('sendTestEmail')}
            isLoading={actionLoading === 'sendTestEmail'}
          >
            📧 ایمیل آزمایشی
          </Button>
        </div>
      </Card>

      {/* Recent Activity Feed */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">آخرین فعالیت‌ها</h2>
          <Link
            href="/admin/audit"
            className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
          >
            مشاهده همه →
          </Link>
        </div>
        {auditEntries.length > 0 ? (
          <div className="space-y-2">
            {auditEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--surface-2)] px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xs font-bold text-[var(--color-primary)]">
                    {ACTION_LABELS[entry.action]?.charAt(0) ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      {ACTION_LABELS[entry.action] ?? entry.action}
                    </p>
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      {entry.user_name || 'ناشناخته'} — {entry.details}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-[var(--text-muted)]">
                  {new Date(entry.timestamp).toLocaleString('fa-IR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">هنوز فعالیتی ثبت نشده است.</p>
        )}
      </Card>

      {/* Quick Links */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">دسترسی سریع</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: '/admin/analytics', label: 'آمار و تحلیل', icon: '📈' },
            { href: '/admin/content', label: 'مدیریت محتوا', icon: '📝' },
            { href: '/admin/tools', label: 'مدیریت ابزارها', icon: '🛠️' },
            { href: '/admin/users', label: 'مدیریت کاربران', icon: '👥' },
            { href: '/admin/site-settings', label: 'تنظیمات سایت', icon: '⚙️' },
            { href: '/admin/monetization', label: 'درآمدزایی', icon: '💰' },
            { href: '/admin/ops', label: 'عملیات سرور', icon: '🖥️' },
            { href: '/admin/audit', label: 'گزارش عملیات', icon: '📋' },
            { href: '/admin/funnel', label: 'قیف تبدیل', icon: '🔄' },
            { href: '/admin/google-search-console', label: 'Google Search Console', icon: '🔍' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
            >
              <span className="text-xl">{link.icon}</span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">{link.label}</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
