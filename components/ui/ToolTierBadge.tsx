'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { getTierByPath, type ToolTier } from '@/lib/tools-registry';

function tierUi(tier: ToolTier) {
  switch (tier) {
    case 'Online-Required':
      return {
        label: 'آنلاین‌محور',
        className:
          'border-[rgb(var(--color-warning-rgb)/0.35)] bg-[rgb(var(--color-warning-rgb)/0.14)] text-[var(--color-warning)]',
      };
    case 'Hybrid':
      return {
        label: 'ترکیبی',
        className:
          'border-[rgb(var(--color-primary-rgb)/0.35)] bg-[rgb(var(--color-primary-rgb)/0.14)] text-[var(--color-primary)]',
      };
    case 'Offline-Guaranteed':
    default:
      return {
        label: 'آفلاین‌تضمینی',
        className:
          'border-[rgb(var(--color-success-rgb)/0.3)] bg-[rgb(var(--color-success-rgb)/0.12)] text-[var(--color-success)]',
      };
  }
}

export default function ToolTierBadge() {
  const pathname = usePathname();
  const tier = useMemo(() => getTierByPath(pathname), [pathname]);
  const ui = tierUi(tier);

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${ui.className}`}
      title={`Tier: ${tier}`}
      aria-label={`رده ابزار: ${ui.label}`}
    >
      <span>{ui.label}</span>
    </div>
  );
}
