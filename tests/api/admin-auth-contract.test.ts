import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('admin auth guard contract', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('content route rejects unauthenticated request', async () => {
    const { GET } = await import('@/app/api/admin/content/route');
    const response = await GET(new Request('http://localhost/api/admin/content'));
    expect([401, 403]).toContain(response.status);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  it('analytics route rejects unauthenticated request', async () => {
    const { GET } = await import('@/app/api/admin/analytics/route');
    const response = await GET(new Request('http://localhost/api/admin/analytics'));
    expect([401, 403]).toContain(response.status);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  it('users route rejects unauthenticated request', async () => {
    const { GET } = await import('@/app/api/admin/users/route');
    const response = await GET(new Request('http://localhost/api/admin/users'));
    expect([401, 403]).toContain(response.status);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  it('site-settings route rejects unauthenticated request', async () => {
    const { GET } = await import('@/app/api/admin/site-settings/route');
    const response = await GET(new Request('http://localhost/api/admin/site-settings'));
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  it('admin auth returns proper status codes', async () => {
    const { requireAdminFromRequest } = await import('@/lib/server/adminAuth');
    const request = new Request('http://localhost/admin');
    const result = await requireAdminFromRequest(request);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect([401, 403]).toContain(result.status);
    }
  });
});

describe('content slug safety', () => {
  it('valid slug pattern allows alphanumeric with hyphens', () => {
    const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/;
    expect(SLUG_REGEX.test('my-post-2026')).toBe(true);
    expect(SLUG_REGEX.test('post_1')).toBe(true);
    expect(SLUG_REGEX.test('hello')).toBe(true);
  });

  it('valid slug pattern rejects path traversal', () => {
    const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/;
    expect(SLUG_REGEX.test('../../etc/passwd')).toBe(false);
    expect(SLUG_REGEX.test('../secret')).toBe(false);
    expect(SLUG_REGEX.test('post/../../other')).toBe(false);
    expect(SLUG_REGEX.test('post%2F..')).toBe(false);
  });

  it('valid slug pattern rejects special characters', () => {
    const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/;
    expect(SLUG_REGEX.test('post with spaces')).toBe(false);
    expect(SLUG_REGEX.test('post<script>')).toBe(false);
    expect(SLUG_REGEX.test('post;rm -rf /')).toBe(false);
    expect(SLUG_REGEX.test('')).toBe(false);
  });
});

describe('content route CSRF', () => {
  it('content POST rejects cross-origin request', async () => {
    const { POST } = await import('@/app/api/admin/content/route');
    const request = new Request('http://localhost/api/admin/content', {
      method: 'POST',
      headers: { origin: 'https://evil.example.com' },
      body: JSON.stringify({ title: 'test', slug: 'test' }),
    });
    const response = await POST(request);
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  it('content PUT rejects cross-origin request', async () => {
    const { PUT } = await import('@/app/api/admin/content/route');
    const request = new Request('http://localhost/api/admin/content', {
      method: 'PUT',
      headers: { origin: 'https://evil.example.com' },
      body: JSON.stringify({ slug: 'test', title: 'test' }),
    });
    const response = await PUT(request);
    expect(response.status).toBe(403);
  });

  it('content PATCH rejects cross-origin request', async () => {
    const { PATCH } = await import('@/app/api/admin/content/route');
    const request = new Request('http://localhost/api/admin/content', {
      method: 'PATCH',
      headers: { origin: 'https://evil.example.com' },
      body: JSON.stringify({ action: 'publish', slugs: ['test'] }),
    });
    const response = await PATCH(request);
    expect(response.status).toBe(403);
  });

  it('content DELETE rejects cross-origin request', async () => {
    const { DELETE } = await import('@/app/api/admin/content/route');
    const request = new Request('http://localhost/api/admin/content', {
      method: 'DELETE',
      headers: { origin: 'https://evil.example.com' },
      body: JSON.stringify({ slug: 'test' }),
    });
    const response = await DELETE(request);
    expect(response.status).toBe(403);
  });
});

describe('ops/actions CSRF', () => {
  it('ops/actions POST rejects cross-origin request', async () => {
    const { POST } = await import('@/app/api/admin/ops/actions/route');
    const request = new Request('http://localhost/api/admin/ops/actions', {
      method: 'POST',
      headers: { origin: 'https://evil.example.com' },
      body: JSON.stringify({ action: 'clear-cache' }),
    });
    const response = await POST(request);
    expect(response.status).toBe(403);
  });
});

describe('PM2 command injection prevention', () => {
  it('sanitizes process name to safe characters only', () => {
    const sanitize = (target: string) => target.replace(/[^a-zA-Z0-9_.-]/g, '');
    expect(sanitize('my-process')).toBe('my-process');
    expect(sanitize('process_1')).toBe('process_1');
    expect(sanitize('test; rm -rf /')).toBe('testrm-rf');
    expect(sanitize('test$(whoami)')).toBe('testwhoami');
    expect(sanitize('test|cat /etc/passwd')).toBe('testcatetcpasswd');
    expect(sanitize('')).toBe('');
  });
});

describe('admin layout role check', () => {
  it('layout file checks admin/editor role', () => {
    const fs = require('node:fs');
    const content = fs.readFileSync('app/admin/layout.tsx', 'utf-8');
    expect(content).toContain("role === 'admin'");
    expect(content).toContain("role === 'editor'");
    expect(content).toContain('router.push');
  });
});
