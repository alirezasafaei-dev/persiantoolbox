import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';

describe('proxy cache policy', () => {
  it('allows short shared caching for anonymous public pages', () => {
    const response = proxy(new NextRequest('https://persiantoolbox.ir/pdf-tools'));

    expect(response.headers.get('cache-control')).toContain('s-maxage=300');
    expect(response.headers.get('cdn-cache-control')).toContain('s-maxage=300');
    expect(response.headers.get('surrogate-control')).toContain('max-age=300');
  });

  it('keeps cookie-bearing requests private', () => {
    const request = new NextRequest('https://persiantoolbox.ir/pdf-tools', {
      headers: { cookie: 'session=private' },
    });
    const response = proxy(request);

    expect(response.headers.get('cache-control')).toContain('private');
    expect(response.headers.get('cdn-cache-control')).toBe('no-store');
  });

  it('keeps account pages and query variants private', () => {
    const accountResponse = proxy(new NextRequest('https://persiantoolbox.ir/account'));
    const queryResponse = proxy(new NextRequest('https://persiantoolbox.ir/tools?q=pdf'));

    expect(accountResponse.headers.get('cache-control')).toContain('private');
    expect(queryResponse.headers.get('cache-control')).toContain('private');
  });

  it('does not override API cache contracts', () => {
    const response = proxy(new NextRequest('https://persiantoolbox.ir/api/data/salary-laws'));

    expect(response.headers.get('cdn-cache-control')).toBeNull();
    expect(response.headers.get('surrogate-control')).toBeNull();
  });
});
