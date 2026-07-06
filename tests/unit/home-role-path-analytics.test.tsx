import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RolePathLink from '@/components/home/RolePathLink';
import type * as AnalyticsEventsModule from '@/shared/analytics/events';
import { ANALYTICS_EVENTS, trackAnalyticsEvent } from '@/shared/analytics/events';

vi.mock('@/shared/analytics/events', async () => {
  const actual = await vi.importActual<typeof AnalyticsEventsModule>('@/shared/analytics/events');

  return {
    ...actual,
    trackAnalyticsEvent: vi.fn(),
  };
});

describe('RolePathLink analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tracks role-based homepage path clicks with safe metadata', async () => {
    const user = userEvent.setup();

    render(
      <RolePathLink
        href="/loan"
        roleTrack="حسابدار، مدیر مالی و منابع انسانی"
        roleBadge="مالی و اداری"
        linkLabel="محاسبه وام"
        linkType="tool"
        position={1}
      >
        محاسبه وام
      </RolePathLink>,
    );

    await user.click(screen.getByRole('link', { name: 'محاسبه وام' }));

    expect(trackAnalyticsEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.ROLE_PATH_CLICK, {
      surface: 'homepage_role_paths',
      roleTrack: 'حسابدار، مدیر مالی و منابع انسانی',
      roleBadge: 'مالی و اداری',
      linkLabel: 'محاسبه وام',
      linkType: 'tool',
      position: 1,
      destination: '/loan',
    });
  });
});
