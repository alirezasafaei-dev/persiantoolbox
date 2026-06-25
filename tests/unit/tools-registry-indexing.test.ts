import { describe, expect, it } from 'vitest';
import { getIndexableTools } from '@/lib/tools-registry';

describe('tools registry indexing policy', () => {
  it('includes implemented tools in indexable sitemap set', () => {
    const paths = new Set(getIndexableTools().map((tool) => tool.path));

    expect(paths.has('/pdf-tools/convert/pdf-to-text')).toBe(true);
    expect(paths.has('/pdf-tools/convert/word-to-pdf')).toBe(true);
    expect(paths.has('/pdf-tools/edit/add-page-numbers')).toBe(true);
    expect(paths.has('/pdf-tools/extract/extract-text')).toBe(true);
  });
});
