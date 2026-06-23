'use client';

import { useState, useEffect } from 'react';
import Card from '@/shared/ui/Card';
import DataTable from '@/shared/ui/DataTable';
import Tabs from '@/shared/ui/Tabs';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import BarChart from '@/shared/ui/charts/BarChart';
import PieChart from '@/shared/ui/charts/PieChart';

type AnalyticsData = {
  totalEvents: number;
  topPaths: Array<{ path: string; views: number }>;
  topEvents: Array<{ event: string; count: number }>;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-primary)]">آمار و تحلیل</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">بررسی عملکرد سایت و رفتار کاربران</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
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
      </div>

      {topPathsForChart.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-4 text-sm font-bold text-[var(--text-primary)]">مسیرهای پربازدید</h3>
            <BarChart data={topPathsForChart} height={180} />
          </Card>
          {eventsForChart.length > 0 && (
            <Card className="p-5">
              <h3 className="mb-4 text-sm font-bold text-[var(--text-primary)]">توزیع رویدادها</h3>
              <PieChart data={eventsForChart} size={160} />
            </Card>
          )}
        </div>
      )}

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
          ]}
        />
      </Card>
    </div>
  );
}
