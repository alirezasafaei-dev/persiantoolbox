import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { isAdminUser, hasEditorAccess, hasRole } from '@/lib/server/adminAuth';

describe('blog markdown processing', () => {
  it('frontmatter parsing works with gray-matter', async () => {
    const matter = (await import('gray-matter')).default;
    const fm = `---
title: "Test"
slug: "test"
date: "2026-06-22"
tags: ["a", "b"]
published: true
---
Content here`;

    const { data, content } = matter(fm);
    expect(data['title']).toBe('Test');
    expect(data['slug']).toBe('test');
    expect(data['tags']).toEqual(['a', 'b']);
    expect(data['published']).toBe(true);
    expect(content.trim()).toBe('Content here');
  });

  it('remark pipeline processes markdown to HTML', async () => {
    const { remark } = await import('remark');
    const remarkGfm = (await import('remark-gfm')).default;
    const remarkRehype = (await import('remark-rehype')).default;
    const rehypeStringify = (await import('rehype-stringify')).default;

    const result = remark()
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeStringify)
      .processSync('## Title\n\nBold **text** and `code`');

    const html = String(result);
    expect(html).toContain('<h2');
    expect(html).toContain('Title');
    expect(html).toContain('<strong>');
    expect(html).toContain('Bold');
    expect(html).toContain('<code>');
  });

  it('existing blog posts are valid markdown', () => {
    const blogDir = path.join(process.cwd(), 'content/blog');
    if (!fs.existsSync(blogDir)) {
      return;
    }
    const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(blogDir, file), 'utf8');
      expect(content.startsWith('---')).toBe(true);
      const firstClose = content.indexOf('---', 3);
      expect(firstClose).toBeGreaterThan(3);
    }
  });
});

describe('RBAC role hierarchy', () => {
  it('hasRole returns true for sufficient role level', () => {
    expect(hasRole({ role: 'admin' }, 'admin')).toBe(true);
    expect(hasRole({ role: 'admin' }, 'editor')).toBe(true);
    expect(hasRole({ role: 'admin' }, 'user')).toBe(true);
    expect(hasRole({ role: 'editor' }, 'editor')).toBe(true);
    expect(hasRole({ role: 'editor' }, 'user')).toBe(true);
    expect(hasRole({ role: 'editor' }, 'admin')).toBe(false);
    expect(hasRole({ role: 'user' }, 'admin')).toBe(false);
    expect(hasRole({ role: 'user' }, 'editor')).toBe(false);
    expect(hasRole({ role: 'user' }, 'user')).toBe(true);
    expect(hasRole(null, 'user')).toBe(false);
    expect(hasRole(undefined, 'user')).toBe(false);
  });

  it('hasEditorAccess returns true for admin and editor', () => {
    expect(hasEditorAccess({ email: 'a@b.com', role: 'admin' })).toBe(true);
    expect(hasEditorAccess({ email: 'a@b.com', role: 'editor' })).toBe(true);
    expect(hasEditorAccess({ email: 'a@b.com', role: 'user' })).toBe(false);
    expect(hasEditorAccess(null)).toBe(false);
  });

  it('isAdminUser checks role and email allowlist', () => {
    expect(isAdminUser({ email: 'admin@test.com', role: 'admin' })).toBe(true);
    expect(isAdminUser({ email: 'admin@test.com', role: 'user' })).toBe(false);
    expect(isAdminUser(null)).toBe(false);
  });
});
