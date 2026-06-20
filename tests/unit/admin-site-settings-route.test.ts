import { describe, expect, it } from 'vitest';
import { GET, PUT } from '@/app/api/admin/site-settings/route';

describe('/api/admin/site-settings (v2)', () => {
  it('returns 403 for GET without admin auth', async () => {
    const response = await GET(new Request('http://localhost/api/admin/site-settings'));
    expect(response.status).toBe(403);
  });

  it('returns 403 for PUT without admin auth', async () => {
    const response = await PUT(
      new Request('http://localhost/api/admin/site-settings', {
        method: 'PUT',
        body: JSON.stringify({ portfolioUrl: 'https://example.com' }),
      }),
    );
    expect(response.status).toBe(403);
  });
});
