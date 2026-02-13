import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('framer-motion', () => {
  const wrap = (tag: string) =>
    function MotionMock({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) {
      const elementTag = tag === 'button' ? 'button' : 'div';
      const filteredProps = Object.fromEntries(
        Object.entries(props).filter(
          ([key]) =>
            !['whileHover', 'whileTap', 'initial', 'animate', 'exit', 'transition'].includes(key),
        ),
      );
      return createElement(elementTag, filteredProps, children);
    };

  return {
    motion: new Proxy(
      {},
      {
        get: (_, key: string) => wrap(key),
      },
    ),
    AnimatePresence: ({ children }: { children?: ReactNode }) => <>{children}</>,
  };
});

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
  it('renders v2 navigation when flag is disabled', async () => {
    await renderNavigation('0');

    expect(screen.getByText('ابزارهای متنی')).toBeInTheDocument();
    expect(screen.queryByText('موضوعات')).not.toBeInTheDocument();
  });

  it('renders v3 navigation when flag is enabled', async () => {
    await renderNavigation('1');

    expect(screen.getByText('موضوعات')).toBeInTheDocument();
    expect(screen.queryByText('ابزارهای اعتبارسنجی')).not.toBeInTheDocument();
  });
});
