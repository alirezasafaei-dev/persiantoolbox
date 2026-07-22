import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RolePathLink from '@/components/home/RolePathLink';

vi.mock('@/shared/analytics/events', () => ({
  ANALYTICS_EVENTS: { ROLE_PATH_CLICK: 'role_path_click' },
  trackAnalyticsEvent: vi.fn(),
}));

describe('RolePathLink', () => {
  it('renders children', () => {
    render(
      <RolePathLink
        href="/tools/invoice-generator"
        roleTrack="accountant"
        roleBadge="حسابدار"
        linkLabel="فاکتورساز"
        linkType="tool"
        position={1}
      >
        <span>حسابدار - فاکتورساز</span>
      </RolePathLink>,
    );
    expect(screen.getByText('حسابدار - فاکتورساز')).toBeDefined();
  });

  it('renders as a link with correct href', () => {
    render(
      <RolePathLink
        href="/tools/invoice-generator"
        roleTrack="accountant"
        roleBadge="حسابدار"
        linkLabel="فاکتورساز"
        linkType="tool"
        position={1}
      >
        <span>فاکتورساز</span>
      </RolePathLink>,
    );
    const link = screen.getByRole('link', { name: /فاکتورساز/ });
    expect(link).toHaveAttribute('href', '/tools/invoice-generator');
  });

  it('renders multiple children', () => {
    render(
      <RolePathLink
        href="/tools/invoice-generator"
        roleTrack="accountant"
        roleBadge="حسابدار"
        linkLabel="فاکتورساز"
        linkType="tool"
        position={1}
      >
        <span>فاکتورساز</span>
        <span>ماشین‌حساب وام</span>
      </RolePathLink>,
    );
    expect(screen.getByText('فاکتورساز')).toBeDefined();
    expect(screen.getByText('ماشین‌حساب وام')).toBeDefined();
  });
});
