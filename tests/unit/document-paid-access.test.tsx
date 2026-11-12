import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
const state = vi.hoisted(() => ({ premium: true, funnel: vi.fn() }));
vi.mock('@/shared/hooks/useSubscriptionStatus', () => ({
  useSubscriptionStatus: () => ({
    isPremium: state.premium,
    planId: 'pack-3',
    expiresAt: '2099-01-01',
  }),
}));
vi.mock('@/shared/analytics/useExportFunnel', () => ({
  useExportFunnel: (...args: unknown[]) => {
    state.funnel(...args);
    return {
      trackExportClick: vi.fn(),
      trackUpgradeView: vi.fn(),
      trackTokenIssued: vi.fn(),
      trackExportConfirm: vi.fn(),
      trackExportCancel: vi.fn(),
    };
  },
}));
import DocumentStudio from '@/components/features/business-documents/DocumentStudio';
import { toJalali } from '@/lib/business-documents/calculations';
describe('paid document access', () => {
  beforeEach(() => {
    state.premium = true;
    vi.clearAllMocks();
  });
  it('recognizes the authenticated pack without a premium prop or reload', () => {
    render(<DocumentStudio initialDocumentType="invoice" />);
    expect(state.funnel).toHaveBeenLastCalledWith('business', 'document-studio', true);
    expect(screen.queryByText(/نسخه رایگان —/)).toBeNull();
  });
  it('keeps free accounts free', () => {
    state.premium = false;
    render(<DocumentStudio initialDocumentType="invoice" />);
    expect(state.funnel).toHaveBeenLastCalledWith('business', 'document-studio', false);
  });
  it('renders the actual Persian calendar date', () => {
    expect(toJalali(new Date('2026-11-12'))).toBe('۱۴۰۵/۰۸/۲۱');
  });
});
