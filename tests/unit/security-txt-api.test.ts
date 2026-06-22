import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/security-txt/route';

describe('GET /api/security-txt', () => {
  it('returns 200 with text/plain content', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/plain');
  });

  it('contains required security.txt fields', async () => {
    const response = await GET();
    const body = await response.text();

    expect(body).toContain('Contact:');
    expect(body).toContain('Preferred-Languages:');
    expect(body).toContain('Canonical:');
    expect(body).toContain('Expires:');
    expect(body).toContain('Policy:');
  });

  it('contains persiantoolbox.ir in contact', async () => {
    const response = await GET();
    const body = await response.text();

    expect(body).toContain('persiantoolbox.ir');
  });
});
