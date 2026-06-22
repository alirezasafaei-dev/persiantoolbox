'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StatCard from '@/shared/ui/StatCard';
import Card from '@/shared/ui/Card';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';

type DashboardData = {
  users: { total: number; active: number };
  subscriptions: { active: number; revenue: number };
  analytics: { todayViews: number; topTools: Array<{ name: string; views: number }> };
  system: { version: string; uptime: string; memory: number };
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/ops').then((r) => r.json()),
      fetch('/api/admin/analytics')
        .then((r) => r.json())
        .catch(() => null),
    ])
      .then(([ops, analytics]) => {
        setData({
          users: { total: 0, active: 0 },
          subscriptions: { active: 0, revenue: 0 },
          analytics: {
            todayViews: analytics?.totalEvents ?? 0,
            topTools: analytics?.topPaths?.slice(0, 5) ?? [],
          },
          system: {
            version: ops?.runtime?.version ?? 'unknown',
            uptime: ops?.runtime?.uptime ?? '0',
            memory: ops?.runtime?.memoryMB ?? 0,
          },
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-primary)]">داشبورد مدیریت</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">نمای کلی وضعیت سایت</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="بازدید امروز"
          value={data?.analytics.todayViews?.toLocaleString('fa-IR') ?? '۰'}
          description="صفحات مشاهده شده"
        />
        <StatCard
          title="اشتراک‌های فعال"
          value={data?.subscriptions.active?.toLocaleString('fa-IR') ?? '۰'}
          description="کاربران پریمیوم"
        />
        <StatCard
          title="نسخه سایت"
          value={data?.system.version ?? '—'}
          description={`حافظه: ${data?.system.memory ?? 0}MB`}
        />
        <StatCard title="ابزارهای فعال" value="۵۷" description="در ۶ دسته‌بندی" />
      </div>

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
            { href: '/admin/funnel', label: 'قیف تبدیل', icon: '🔄' },
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

      {/* System Info */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">اطلاعات سیستم</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
            <p className="text-xs text-[var(--text-muted)]">نسخه Node.js</p>
            <p className="mt-1 font-mono text-sm text-[var(--text-primary)]">v20.20.2</p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
            <p className="text-xs text-[var(--text-muted)]">نسخه اپلیکیشن</p>
            <p className="mt-1 font-mono text-sm text-[var(--text-primary)]">
              {data?.system.version ?? '—'}
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
            <p className="text-xs text-[var(--text-muted)]">حافظه مصرفی</p>
            <p className="mt-1 font-mono text-sm text-[var(--text-primary)]">
              {data?.system.memory ?? 0} MB
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
