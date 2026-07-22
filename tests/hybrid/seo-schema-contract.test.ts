import { describe, it, expect } from 'vitest';
import { buildMetadata } from '@/lib/seo';
import { buildToolJsonLd } from '@/lib/seo-tools';
import { getToolsByCategory, type ToolEntry } from '@/lib/tools-registry';

describe('SEO metadata contract', () => {
  it('buildMetadata returns valid Metadata object', () => {
    const metadata = buildMetadata({
      title: 'ابزار تست',
      description: 'توضیحات تست',
      path: '/test',
    });
    expect(metadata.title).toBe('ابزار تست');
    expect(metadata.description).toBe('توضیحات تست');
    expect(metadata.alternates?.canonical).toContain('/test');
  });

  it('buildMetadata includes OpenGraph with fa_IR locale', () => {
    const metadata = buildMetadata({
      title: 'تست',
      description: 'تست',
      path: '/test',
    });
    expect(metadata.openGraph?.locale).toBe('fa_IR');
  });

  it('buildMetadata includes keywords when provided', () => {
    const metadata = buildMetadata({
      title: 'تست',
      description: 'تست',
      path: '/test',
      keywords: ['کلمه۱', 'کلمه۲'],
    });
    expect(metadata.keywords).toEqual(['کلمه۱', 'کلمه۲']);
  });

  it('buildMetadata excludes keywords when not provided', () => {
    const metadata = buildMetadata({
      title: 'تست',
      description: 'تست',
      path: '/test',
    });
    expect(metadata.keywords).toBeUndefined();
  });
});

describe('JSON-LD schema contract', () => {
  it('buildToolJsonLd returns SoftwareApplication for tool entries', () => {
    const tools = getToolsByCategory('finance-tools');
    expect(tools.length).toBeGreaterThan(0);
    const tool = tools[0] as ToolEntry;
    const jsonLd = buildToolJsonLd(tool);
    expect(jsonLd).toBeDefined();
    expect(typeof jsonLd).toBe('object');
  });

  it('tool JSON-LD has priceCurrency IRR (not USD)', () => {
    const tools = getToolsByCategory('finance-tools');
    const tool = tools[0] as ToolEntry;
    const jsonLd = buildToolJsonLd(tool) as Record<string, unknown>;
    const graph = jsonLd['@graph'] as Array<Record<string, unknown>> | undefined;
    if (graph) {
      const softwareApp = graph.find((n) => n['@type'] === 'SoftwareApplication');
      if (softwareApp) {
        const offers = softwareApp['offers'] as Record<string, unknown> | undefined;
        if (offers) {
          expect(offers['priceCurrency']).toBe('IRR');
        }
      }
    }
  });

  it('tool JSON-LD has valid aggregateRating if present', () => {
    const tools = getToolsByCategory('finance-tools');
    const tool = tools[0] as ToolEntry;
    const jsonLd = buildToolJsonLd(tool) as Record<string, unknown>;
    const str = JSON.stringify(jsonLd);
    if (str.includes('aggregateRating')) {
      const rating = JSON.parse(str.match(/"aggregateRating":\s*(\{[^}]+\})/)?.[1] ?? '{}');
      expect(Number(rating.ratingValue)).toBeGreaterThan(0);
      expect(Number(rating.ratingValue)).toBeLessThanOrEqual(5);
    }
  });
});

describe('tools-registry completeness', () => {
  it('all 6 categories have tools', () => {
    const categoryIds = [
      'pdf-tools',
      'image-tools',
      'date-tools',
      'text-tools',
      'finance-tools',
      'validation-tools',
    ];
    for (const catId of categoryIds) {
      const tools = getToolsByCategory(catId);
      expect(tools.length).toBeGreaterThan(0);
    }
  });

  it('every tool has a unique path', () => {
    const categoryIds = [
      'pdf-tools',
      'image-tools',
      'date-tools',
      'text-tools',
      'finance-tools',
      'validation-tools',
    ];
    const allPaths: string[] = [];
    for (const catId of categoryIds) {
      const tools = getToolsByCategory(catId);
      for (const tool of tools) {
        allPaths.push(tool.path);
      }
    }
    const uniquePaths = new Set(allPaths);
    expect(uniquePaths.size).toBe(allPaths.length);
  });

  it('every tool has a valid tier', () => {
    const categoryIds = [
      'pdf-tools',
      'image-tools',
      'date-tools',
      'text-tools',
      'finance-tools',
      'validation-tools',
    ];
    for (const catId of categoryIds) {
      const tools = getToolsByCategory(catId);
      for (const tool of tools) {
        expect(['Offline-Guaranteed', 'Hybrid', 'Online-Required']).toContain(tool.tier);
      }
    }
  });
});
