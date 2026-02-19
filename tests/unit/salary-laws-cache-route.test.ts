import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/data/salary-laws/route';

describe('salary laws api cache contract', () => {
  it('returns cache headers and etag for fresh response', async () => {
    const response = await GET(new Request('http://localhost/api/data/salary-laws'));

    expect(response.status).toBe(200);
    const etag = response.headers.get('etag');
    expect(etag).toBeTruthy();
    expect(response.headers.get('cache-control')).toContain('s-maxage=3600');
    expect(response.headers.get('last-modified')).toBeTruthy();
  });

  it('returns 304 when if-none-match equals current etag', async () => {
    const first = await GET(new Request('http://localhost/api/data/salary-laws'));
    const etag = first.headers.get('etag');
    expect(etag).toBeTruthy();

    const second = await GET(
      new Request('http://localhost/api/data/salary-laws', {
        headers: {
          'if-none-match': etag ?? '',
        },
      }),
    );

    expect(second.status).toBe(304);
  });
});
