import type { ReactNode } from 'react';
import SiteShell from '@/components/ui/SiteShell';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ToolTierBadge from '@/components/ui/ToolTierBadge';

export default function ToolsLayout({ children }: { children: ReactNode }) {
  const topSlot = (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/85 p-4 shadow-[var(--shadow-subtle)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumbs />
        <ToolTierBadge />
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--color-success-rgb)/0.35)] bg-[rgb(var(--color-success-rgb)/0.12)] px-3 py-1 text-xs font-semibold text-[var(--color-success)]">
          اجرای محلی فعال
        </div>
      </div>
    </div>
  );

  return (
    <SiteShell containerClassName="py-10" topSlot={topSlot}>
      {children}
    </SiteShell>
  );
}
