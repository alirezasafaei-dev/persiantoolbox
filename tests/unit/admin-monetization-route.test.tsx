import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const analyticsSummary = {
  lastUpdated: null,
  totalEvents: 0,
  eventCounts: {},
  pathCounts: {},
  version: 1 as const,
};

vi.mock('@/lib/analyticsStore', () => ({
  getAnalyticsSummary: vi.fn(async () => analyticsSummary),
}));

vi.mock('@/lib/admin/monetizationApiClient', () => ({
  fetchMonetizationData: vi.fn(async () => ({ slots: [], campaigns: [], error: null })),
  createMonetizationSlot: vi.fn(),
  updateMonetizationSlot: vi.fn(),
  deleteMonetizationSlot: vi.fn(),
  createMonetizationCampaign: vi.fn(),
  updateMonetizationCampaign: vi.fn(),
  deleteMonetizationCampaign: vi.fn(),
}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('admin monetization route', () => {
  it('renders the monetization admin panel when the feature flag is enabled', async () => {
    vi.stubEnv('FEATURE_ADMIN_MONETIZATION_ENABLED', 'true');
    const { default: MonetizationAdminRoute } = await import('@/app/admin/monetization/page');

    render(await MonetizationAdminRoute());

    expect(screen.getByRole('heading', { name: /مدیریت درآمد و تبلیغات/ })).toBeInTheDocument();
  });
});
