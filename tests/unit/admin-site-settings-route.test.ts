import { describe, expect, it } from 'vitest';
import { GET, PUT } from '@/app/api/admin/site-settings/route';

describe('/api/admin/site-settings (v2)', () => {
  it('returns 410 for GET', async () => {
    const response = await GET(new Request('http://localhost/api/admin/site-settings'));
    expect(response.status).toBe(410);
  });

  it('returns 410 for PUT', async () => {
    const response = await PUT(
      new Request('http://localhost/api/admin/site-settings', {
        method: 'PUT',
        body: JSON.stringify({ portfolioUrl: 'https://example.com' }),
      }),
    );
    expect(response.status).toBe(410);
  });
});
