import { describe, expect, it } from 'vitest';
import { getIndexableTools } from '@/lib/tools-registry';

describe('tools registry indexing policy', () => {
  it('keeps coming-soon tools out of indexable sitemap set', () => {
    const paths = new Set(getIndexableTools().map((tool) => tool.path));

    expect(paths.has('/pdf-tools/convert/pdf-to-text')).toBe(false);
    expect(paths.has('/pdf-tools/convert/word-to-pdf')).toBe(false);
  });
});
