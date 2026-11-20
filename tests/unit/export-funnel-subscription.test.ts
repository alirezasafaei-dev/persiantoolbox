import { act, renderHook } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { useExportFunnel } from '@/shared/analytics/useExportFunnel';
import { trackExportFunnel } from '@/shared/analytics/events';

vi.mock('@/shared/analytics/events', async (original) => ({
  ...(await original<Record<string, unknown>>()),
  trackExportFunnel: vi.fn(),
}));

beforeEach(() => vi.clearAllMocks());

it('records subscription changes after the account status loads and expires', () => {
  const { result, rerender } = renderHook(
    ({ premium }) => useExportFunnel('business', 'document-studio', premium),
    { initialProps: { premium: false } },
  );
  act(() => result.current.trackExportClick('pdf'));
  expect(trackExportFunnel).toHaveBeenLastCalledWith(
    'export_click',
    expect.objectContaining({ isPremium: false }),
  );
  rerender({ premium: true });
  act(() => {
    result.current.trackExportClick('pdf');
    result.current.trackTokenIssued('pdf', 'success');
    result.current.trackExportConfirm('pdf');
  });
  for (const [, metadata] of vi.mocked(trackExportFunnel).mock.calls.slice(1)) {
    expect(metadata).toMatchObject({
      product: 'business',
      source: 'document-studio',
      isPremium: true,
    });
  }
  rerender({ premium: false });
  act(() => result.current.trackExportCancel('docx'));
  expect(trackExportFunnel).toHaveBeenLastCalledWith(
    'export_cancel',
    expect.objectContaining({ isPremium: false }),
  );
});
