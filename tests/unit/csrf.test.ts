import { describe, expect, it } from 'vitest';
import { isSameOrigin } from '@/lib/server/csrf';

describe('csrf same-origin guard', () => {
  const baseUrl = 'https://persiantoolbox.ir/api/auth/login';

  it('allows when origin matches', () => {
    const request = new Request(baseUrl, {
      headers: { origin: 'https://persiantoolbox.ir' },
    });
    expect(isSameOrigin(request)).toBe(true);
  });

  it('blocks when origin mismatches', () => {
    const request = new Request(baseUrl, {
      headers: { origin: 'https://evil.example' },
    });
    expect(isSameOrigin(request)).toBe(false);
  });

  it('allows when referer matches and origin missing', () => {
    const request = new Request(baseUrl, {
      headers: { referer: 'https://persiantoolbox.ir/account' },
    });
    expect(isSameOrigin(request)).toBe(true);
  });

  it('blocks when referer mismatches', () => {
    const request = new Request(baseUrl, {
      headers: { referer: 'https://evil.example/phish' },
    });
    expect(isSameOrigin(request)).toBe(false);
  });

  it('allows when no origin or referer provided', () => {
    const request = new Request(baseUrl);
    expect(isSameOrigin(request)).toBe(true);
  });

  it('blocks when referer is malformed', () => {
    const request = new Request(baseUrl, {
      headers: { referer: 'not-a-valid-url' },
    });
    expect(isSameOrigin(request)).toBe(false);
  });
});
