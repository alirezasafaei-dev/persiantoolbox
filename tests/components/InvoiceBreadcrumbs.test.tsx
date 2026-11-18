import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ToolsRouteShell from '@/components/ui/ToolsRouteShell';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import { getToolWithMetadataOverride } from '@/lib/tool-metadata-overrides';

const route = vi.hoisted(() => ({ pathname: '/tools/invoice-generator' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));
vi.mock('@/components/ui/SiteShell', () => ({
  default: ({ topSlot, children }: { topSlot: ReactNode; children: ReactNode }) => (
    <main>
      {topSlot}
      {children}
    </main>
  ),
}));
vi.mock('@/components/ui/ToolTierBadge', () => ({ default: () => <span>tier preserved</span> }));

describe('invoice breadcrumb ownership', () => {
  it('renders home once when callers already supply it', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'خانه', href: '/' },
          { label: 'فاکتور', current: true },
        ]}
      />,
    );
    expect(screen.getAllByRole('link', { name: 'خانه' })).toHaveLength(1);
  });

  it('uses the registered category and actual invoice as the current page', () => {
    route.pathname = '/tools/invoice-generator';
    const tool = getToolWithMetadataOverride('/tools/invoice-generator');
    render(
      <ToolsRouteShell>
        <p>invoice content</p>
      </ToolsRouteShell>,
    );
    const nav = screen.getByRole('navigation', { name: 'مسیر ناوبری' });
    expect(within(nav).getAllByRole('link', { name: 'خانه' })).toHaveLength(1);
    expect(within(nav).getByRole('link', { name: tool.category!.name })).toHaveAttribute(
      'href',
      tool.category!.path,
    );
    expect(within(nav).getByText(tool.title)).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('tier preserved')).toBeInTheDocument();
  });

  it('does not link a category root to itself', () => {
    route.pathname = '/pdf-tools';
    const category = getToolByPathOrThrow(route.pathname);
    render(
      <ToolsRouteShell>
        <p>category content</p>
      </ToolsRouteShell>,
    );
    const nav = screen.getByRole('navigation', { name: 'مسیر ناوبری' });
    expect(within(nav).getAllByRole('link')).toHaveLength(1);
    expect(within(nav).getByText(category.title)).toHaveAttribute('aria-current', 'page');
  });
});
