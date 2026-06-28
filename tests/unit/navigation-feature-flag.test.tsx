import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    prefetch,
    ...props
  }: {
    href: string;
    children: ReactNode;
    prefetch?: boolean;
    [key: string]: unknown;
  }) => {
    void prefetch;
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

vi.mock('@/shared/ui/Container', () => ({
  default: ({ children, className }: { children?: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

const envKey = 'NEXT_PUBLIC_FEATURE_V3_NAV';
const originalFlag = process.env[envKey];

async function renderNavigation(flag: string) {
  process.env[envKey] = flag;
  vi.resetModules();
  const { default: Navigation } = await import('@/components/ui/Navigation');
  render(<Navigation />);
}

afterEach(() => {
  if (originalFlag === undefined) {
    delete process.env[envKey];
  } else {
    process.env[envKey] = originalFlag;
  }
  vi.resetModules();
});

describe('navigation feature flag', () => {
  it('renders grouped navigation when flag is disabled', async () => {
    await renderNavigation('0');

    expect(screen.getAllByText('ابزارها').length).toBeGreaterThanOrEqual(1);
  });

  it('renders v3 navigation when flag is enabled', async () => {
    await renderNavigation('1');

    expect(screen.getAllByText('ابزارها').length).toBeGreaterThanOrEqual(1);
  });
});
