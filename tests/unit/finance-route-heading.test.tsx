import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('next/dynamic', () => ({
  default:
    () =>
    ({ showTitle }: { showTitle?: boolean }) => (
      <div>{showTitle !== false && <h2>Calculator title</h2>}Loading calculator</div>
    ),
}));
vi.mock('next/script', () => ({ default: () => null }));
vi.mock('@/components/ui/ToolPageShell', () => ({
  default: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));
vi.mock('@/components/seo/BreadcrumbSchema', () => ({ default: () => null }));
vi.mock('@/components/finance/FinancialTransparencyBox', () => ({ default: () => null }));

describe('finance route server headings', () => {
  it.each([
    ['currency-converter', 'مبدل ارز'],
    ['inflation-calculator', 'محاسبه‌گر تورم'],
    ['retirement-calculator', 'محاسبه حقوق بازنشستگی'],
  ])('exposes one descriptive H1 before %s calculator loads', async (slug, heading) => {
    const Route = (await import(`../../app/(tools)/tools/${slug}/page.tsx`)).default;
    const html = renderToStaticMarkup(<Route />);
    const document = new DOMParser().parseFromString(html, 'text/html');
    const headings = document.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings.item(0)?.textContent).toBe(heading);
    expect(document.querySelectorAll('h2')).toHaveLength(0);
  });
});
