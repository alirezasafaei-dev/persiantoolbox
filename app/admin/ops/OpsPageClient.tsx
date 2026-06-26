'use client';

import dynamic from 'next/dynamic';

const OpsDashboardClient = dynamic(() => import('@/components/features/admin/OpsDashboardClient'), {
  loading: () => (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
    </div>
  ),
});

export default function OpsPageClient() {
  return <OpsDashboardClient />;
}
