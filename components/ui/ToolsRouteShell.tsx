'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import SiteShell from '@/components/ui/SiteShell';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ToolTierBadge from '@/components/ui/ToolTierBadge';
import { getBreadcrumbs } from '@/lib/route-labels';
import { getTierByPath, getToolByPath } from '@/lib/tools-registry';
import { TOOL_METADATA_OVERRIDES } from '@/lib/tool-metadata-overrides';

export default function ToolsRouteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '';
  const shouldHideFooter = pathname === '/tools/specialized' || pathname === '/tools/specialized/';

  // Generate breadcrumbs using Persian route labels
  const entry = getToolByPath(pathname.replace(/\/$/, ''));
  const metadata = Object.entries(TOOL_METADATA_OVERRIDES).find(
    ([path]) => path === entry?.path,
  )?.[1];
  const tool = entry ? { ...entry, ...metadata } : undefined;
  const routeItems = tool
    ? [
        ...(tool.kind === 'tool' && tool.category
          ? [{ label: tool.category.name, href: tool.category.path }]
          : []),
        { label: tool.title, href: tool.path },
      ]
    : getBreadcrumbs(pathname);
  const breadcrumbItems = routeItems.map((item, index, items) => ({
    label: item.label,
    href: index === items.length - 1 ? undefined : item.href,
    current: index === items.length - 1,
  }));

  const topSlot = (
    <div className="rounded-lg border border-(--border-light) bg-(--surface-1)/85 p-4 shadow-subtle">
      <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2 md:flex md:flex-wrap md:justify-between">
        <div className="col-span-full min-w-0 md:contents">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <ToolTierBadge />
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--color-success-rgb)/0.35)] bg-[rgb(var(--color-success-rgb)/0.12)] px-3 py-1 text-xs font-semibold text-[var(--color-success)]">
          {getTierByPath(pathname) === 'Online-Required'
            ? 'نیازمند اتصال اینترنت'
            : 'اجرای محلی فعال'}
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
