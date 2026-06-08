'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import SiteShell from '@/components/ui/SiteShell';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ToolTierBadge from '@/components/ui/ToolTierBadge';

export default function ToolsRouteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '';
  const shouldHideFooter = pathname === '/tools/specialized' || pathname === '/tools/specialized/';

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathSegments.map((segment, index) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
    href:
      index === pathSegments.length - 1
        ? undefined
        : `/${pathSegments.slice(0, index + 1).join('/')}`,
    current: index === pathSegments.length - 1,
  }));

  const topSlot = (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/85 p-4 shadow-[var(--shadow-subtle)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumbs items={breadcrumbItems} />
        <ToolTierBadge />
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--color-success-rgb)/0.35)] bg-[rgb(var(--color-success-rgb)/0.12)] px-3 py-1 text-xs font-semibold text-[var(--color-success)]">
          اجرای محلی فعال
        </div>
      </div>
    </div>
  );

  return (
    <SiteShell containerClassName="py-10" topSlot={topSlot} withFooter={!shouldHideFooter}>
      {children}
    </SiteShell>
  );
}
