import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, PUT } from '@/app/api/admin/site-settings/route';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import {
  SiteSettingsStorageUnavailableError,
  getPublicSiteSettings,
  updateSiteSettings,
} from '@/lib/server/siteSettings';

vi.mock('@/lib/server/adminAuth', () => ({
  requireAdminFromRequest: vi.fn(),
}));

vi.mock('@/lib/server/siteSettings', () => ({
  getPublicSiteSettings: vi.fn(),
  updateSiteSettings: vi.fn(),
  SiteSettingsStorageUnavailableError: class SiteSettingsStorageUnavailableError extends Error {},
}));

const mockRequireAdminFromRequest = vi.mocked(requireAdminFromRequest);
const mockGetPublicSiteSettings = vi.mocked(getPublicSiteSettings);
const mockUpdateSiteSettings = vi.mocked(updateSiteSettings);

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('/api/admin/site-settings', () => {
  it('blocks non-admin users on GET', async () => {
    mockRequireAdminFromRequest.mockResolvedValueOnce({ ok: false, status: 403 });
    const response = await GET(new Request('http://localhost/api/admin/site-settings'));
    expect(response.status).toBe(403);
  });

  it('returns settings for admin GET', async () => {
    mockRequireAdminFromRequest.mockResolvedValueOnce({
      ok: true,
      user: { id: 'u1', email: 'admin@example.com', passwordHash: 'x', createdAt: Date.now() },
    });
    mockGetPublicSiteSettings.mockResolvedValueOnce({
      developerName: 'علیرضا صفایی',
      developerBrandText: 'متن',
      orderUrl: '/support',
      portfolioUrl: null,
    });

    const response = await GET(new Request('http://localhost/api/admin/site-settings'));
    expect(response.status).toBe(200);
  });

  it('validates invalid payload on PUT', async () => {
    mockRequireAdminFromRequest.mockResolvedValueOnce({
      ok: true,
      user: { id: 'u1', email: 'admin@example.com', passwordHash: 'x', createdAt: Date.now() },
    });
    const response = await PUT(
      new Request('http://localhost/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderUrl: 'data:text/plain,hello' }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mockUpdateSiteSettings).not.toHaveBeenCalled();
  });

  it('returns 503 when storage is unavailable', async () => {
    mockRequireAdminFromRequest.mockResolvedValueOnce({
      ok: true,
      user: { id: 'u1', email: 'admin@example.com', passwordHash: 'x', createdAt: Date.now() },
    });
    mockUpdateSiteSettings.mockRejectedValueOnce(new SiteSettingsStorageUnavailableError());

    const response = await PUT(
      new Request('http://localhost/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ portfolioUrl: null }),
      }),
    );

    expect(response.status).toBe(503);
  });
});
