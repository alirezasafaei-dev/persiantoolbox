'use client';

import dynamic from 'next/dynamic';

const OpsDashboardClient = dynamic(() => import('@/components/features/admin/OpsDashboardClient'), {
  ssr: false,
});

export default function OpsPageClient() {
  return <OpsDashboardClient />;
}
