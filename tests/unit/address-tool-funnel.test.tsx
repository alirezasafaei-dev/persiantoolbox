import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddressFaToEnTool from '@/components/features/text-tools/AddressFaToEnTool';
import type * as AnalyticsEventsModule from '@/shared/analytics/events';
import { ANALYTICS_EVENTS, trackAnalyticsEvent } from '@/shared/analytics/events';

vi.mock('@/shared/ui/toast-context', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock('@/shared/analytics/events', async () => {
  const actual = await vi.importActual<typeof AnalyticsEventsModule>('@/shared/analytics/events');
  return { ...actual, trackAnalyticsEvent: vi.fn() };
});

describe('address tool funnel baseline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tracks one privacy-safe start on first input and one completion on first result', async () => {
    const user = userEvent.setup();
    render(<AddressFaToEnTool compact />);

    expect(trackAnalyticsEvent).not.toHaveBeenCalledWith(
      ANALYTICS_EVENTS.TOOL_START,
      expect.anything(),
    );

    await user.type(screen.getByLabelText('استان'), 'تهران');
    await user.type(screen.getByLabelText('شهر'), 'تهران');
    await user.type(screen.getByLabelText('خیابان'), 'ولیعصر');
    await user.type(screen.getByLabelText('پلاک'), '۱۲');

    await waitFor(() => {
      expect(trackAnalyticsEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.TOOL_START, {
        tool_id: 'address-fa-to-en',
        category: 'text-tools',
      });
      expect(trackAnalyticsEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.TOOL_COMPLETE, {
        tool_id: 'address-fa-to-en',
        category: 'text-tools',
      });
    });

    await user.type(screen.getByLabelText('پلاک'), '۳');

    const startCalls = vi
      .mocked(trackAnalyticsEvent)
      .mock.calls.filter(([event]) => event === ANALYTICS_EVENTS.TOOL_START);
    const completeCalls = vi
      .mocked(trackAnalyticsEvent)
      .mock.calls.filter(([event]) => event === ANALYTICS_EVENTS.TOOL_COMPLETE);
    expect(startCalls).toHaveLength(1);
    expect(completeCalls).toHaveLength(1);
    expect(JSON.stringify([...startCalls, ...completeCalls])).not.toContain('ولیعصر');
  });
});
