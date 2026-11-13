import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { utilityGroups, footerPageLinks } from '@/lib/navigation';
import { getToolByPath } from '@/lib/tools-registry';
import { searchTools } from '@/lib/tool-search';
import ToolsDashboardPage from '@/components/features/tools-dashboard/ToolsDashboardPage';

vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));

it.each(['/developers', '/market'])('exposes %s in navigation and as a searchable hub', (path) => {
  expect(utilityGroups.flatMap((group) => group.items).some((item) => item.href === path)).toBe(
    true,
  );
  expect(footerPageLinks.some((item) => item.href === path)).toBe(true);
  expect(getToolByPath(path)).toMatchObject({ kind: 'hub', indexable: true });
});

it.each([
  ['API', '/developers'],
  ['توسعه‌دهندگان', '/developers'],
  ['بازار', '/market'],
])('finds specialist destination for %s', (query, path) => {
  expect(searchTools(undefined, query).some((entry) => entry.path === path)).toBe(true);
});

it('keeps matching specialist links visible when the tool-list query has no ordinary tools', () => {
  render(<ToolsDashboardPage />);
  expect(screen.getByRole('link', { name: /توسعه‌دهندگان و API/ })).toHaveAttribute(
    'href',
    '/developers',
  );
  expect(screen.getByRole('link', { name: /داشبورد بازار/ })).toHaveAttribute('href', '/market');
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'API' } });
  expect(screen.getByRole('link', { name: /توسعه‌دهندگان و API/ })).toBeVisible();
  expect(screen.queryByText('ابزاری پیدا نشد')).not.toBeInTheDocument();
});
