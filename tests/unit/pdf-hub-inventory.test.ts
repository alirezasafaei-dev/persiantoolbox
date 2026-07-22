import { describe, expect, it } from 'vitest';
import { getToolsByCategory } from '@/lib/tools-registry';

describe('PDF hub inventory', () => {
  const tools = getToolsByCategory('pdf-tools').filter(
    (tool) => tool.kind === 'tool' && tool.indexable,
  );

  it('has unique canonical paths', () => {
    const paths = tools.map((tool) => tool.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('contains the primary organic acquisition tools', () => {
    const paths = new Set(tools.map((tool) => tool.path));

    expect(paths.has('/pdf-tools/edit/add-page-numbers')).toBe(true);
    expect(paths.has('/pdf-tools/edit/rotate-pages')).toBe(true);
    expect(paths.has('/pdf-tools/compress/compress-pdf')).toBe(true);
    expect(paths.has('/pdf-tools/merge/merge-pdf')).toBe(true);
    expect(paths.has('/pdf-tools/split/split-pdf')).toBe(true);
  });

  it('does not expose redirect-only category routes as tools', () => {
    const paths = tools.map((tool) => tool.path);
    const redirectOnlyRoutes = [
      '/pdf-tools/edit',
      '/pdf-tools/convert',
      '/pdf-tools/extract',
      '/pdf-tools/security',
      '/pdf-tools/split',
    ];

    redirectOnlyRoutes.forEach((path) => expect(paths).not.toContain(path));
  });
});
