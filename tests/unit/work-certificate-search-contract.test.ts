import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { getToolWithMetadataOverride } from '@/lib/tool-metadata-overrides';

it('describes certificate examples and export formats on the canonical tool page', () => {
  const tool = getToolWithMetadataOverride('/career-tools/work-certificate');
  expect(tool.path).toBe('/career-tools/work-certificate');
  expect(tool.title).toContain('گواهی اشتغال به کار');
  expect(tool.description).toContain('نمونه متن');
  expect(tool.description).toContain('PDF و Word');
});

it('publishes one breadcrumb schema for the certificate page', () => {
  const page = readFileSync('app/career-tools/work-certificate/page.tsx', 'utf8');
  expect(page.match(/<BreadcrumbSchema\b/g)).toHaveLength(1);
  expect(page).not.toContain("'@type': 'BreadcrumbList'");
});
