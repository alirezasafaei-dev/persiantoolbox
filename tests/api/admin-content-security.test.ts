import { describe, it, expect } from 'vitest';

describe('admin content security contract', () => {
  it('content POST rejects without CSRF origin', async () => {
    const { POST } = await import('@/app/api/admin/content/route');
    const request = new Request('http://localhost/api/admin/content', {
      method: 'POST',
      body: JSON.stringify({ title: 'test', slug: '../../etc/passwd' }),
    });
    const response = await POST(request);
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  it('content POST rejects invalid slug with CSRF origin', async () => {
    const { POST } = await import('@/app/api/admin/content/route');
    const request = new Request('http://localhost/api/admin/content', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000' },
      body: JSON.stringify({ title: 'test', slug: '../../etc/passwd' }),
    });
    const response = await POST(request);
    expect([400, 401, 403]).toContain(response.status);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  it('content POST rejects without CSRF origin (missing slug)', async () => {
    const { POST } = await import('@/app/api/admin/content/route');
    const request = new Request('http://localhost/api/admin/content', {
      method: 'POST',
      body: JSON.stringify({ slug: 'test' }),
    });
    const response = await POST(request);
    expect(response.status).toBe(403);
  });

  it('content PUT rejects without CSRF origin', async () => {
    const { PUT } = await import('@/app/api/admin/content/route');
    const request = new Request('http://localhost/api/admin/content', {
      method: 'PUT',
      body: JSON.stringify({ title: 'test' }),
    });
    const response = await PUT(request);
    expect(response.status).toBe(403);
  });

  it('content PATCH rejects without CSRF origin', async () => {
    const { PATCH } = await import('@/app/api/admin/content/route');
    const request = new Request('http://localhost/api/admin/content', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'invalid' }),
    });
    const response = await PATCH(request);
    expect(response.status).toBe(403);
  });

  it('content DELETE rejects without CSRF origin', async () => {
    const { DELETE } = await import('@/app/api/admin/content/route');
    const request = new Request('http://localhost/api/admin/content', {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
    const response = await DELETE(request);
    expect(response.status).toBe(403);
  });

  it('content path containment check prevents traversal', () => {
    const pathMod = require('node:path');
    const contentDir = pathMod.join(process.cwd(), 'content', 'blog');
    const resolvedDir = pathMod.resolve(contentDir);

    const safePath = pathMod.join(contentDir, 'my-post.md');
    expect(pathMod.resolve(safePath).startsWith(resolvedDir)).toBe(true);

    const traversalPath = pathMod.join(contentDir, '../../etc/passwd.md');
    expect(pathMod.resolve(traversalPath).startsWith(resolvedDir)).toBe(false);
  });

  it('admin audit log has content_update action type', () => {
    const fs = require('node:fs');
    const content = fs.readFileSync('lib/server/auditLog.ts', 'utf-8');
    expect(content).toContain('content_update');
  });

  it('content route writes audit log on mutations', () => {
    const fs = require('node:fs');
    const content = fs.readFileSync('app/api/admin/content/route.ts', 'utf-8');
    expect(content).toContain('admin_audit_log');
    expect(content).toContain('content_update');
  });
});

describe('admin dashboard contract', () => {
  it('dashboard page has res.ok check on quick actions', () => {
    const fs = require('node:fs');
    const content = fs.readFileSync('app/admin/page.tsx', 'utf-8');
    expect(content).toContain('!res.ok');
  });

  it('dashboard page shows error state for failed quick actions', () => {
    const fs = require('node:fs');
    const content = fs.readFileSync('app/admin/page.tsx', 'utf-8');
    expect(content).toContain('setActionError');
  });

  it('dashboard has Persian error messages', () => {
    const fs = require('node:fs');
    const content = fs.readFileSync('app/admin/page.tsx', 'utf-8');
    expect(content).toContain('خطا در انجام عملیات');
  });
});
