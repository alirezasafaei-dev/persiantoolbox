import { describe, it, expect } from 'vitest';
import { buildToolJsonLd, buildTopicJsonLd, buildPillarJsonLd } from '@/lib/seo-tools';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

describe('buildToolJsonLd', () => {
  it('returns correct @context and @graph structure', () => {
    const tool = getToolByPathOrThrow('/tools/json-formatter');
    const result = buildToolJsonLd(tool);
    expect(result['@context']).toBe('https://schema.org');
    expect(Array.isArray(result['@graph'])).toBe(true);
    expect(result['@graph'].length).toBeGreaterThan(0);
  });

  it('includes BreadcrumbList', () => {
    const tool = getToolByPathOrThrow('/tools/json-formatter');
    const result = buildToolJsonLd(tool);
    const types = result['@graph'].map((n: Record<string, unknown>) => n['@type']);
    expect(types).toContain('BreadcrumbList');
  });

  it('includes SoftwareApplication for tools', () => {
    const tool = getToolByPathOrThrow('/tools/json-formatter');
    const result = buildToolJsonLd(tool);
    const types = result['@graph'].map((n: Record<string, unknown>) => n['@type']);
    expect(types).toContain('SoftwareApplication');
    expect(types).toContain('WebApplication');
  });

  it('sets SoftwareApplication properties correctly', () => {
    const tool = getToolByPathOrThrow('/salary');
    const result = buildToolJsonLd(tool);
    const app = result['@graph'].find(
      (n: Record<string, unknown>) => n['@type'] === 'SoftwareApplication',
    ) as Record<string, unknown>;
    expect(app).toBeTruthy();
    expect(app['applicationCategory']).toBe('UtilitiesApplication');
    expect(app['operatingSystem']).toBe('Web');
    expect(app['isAccessibleForFree']).toBe(true);
  });

  it('includes BreadcrumbList with correct positions', () => {
    const tool = getToolByPathOrThrow('/tools/json-formatter');
    const result = buildToolJsonLd(tool);
    const breadcrumbs = result['@graph'].find(
      (n: Record<string, unknown>) => n['@type'] === 'BreadcrumbList',
    ) as Record<string, unknown>;
    const items = breadcrumbs['itemListElement'] as Array<Record<string, unknown>>;
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items[0]['position']).toBe(1);
    expect(items[0]['name']).toBe('صفحه اصلی');
    expect(items[items.length - 1]['name']).not.toContain('جعبه ابزار فارسی');
  });

  it('includes FAQ when tool has FAQ content', () => {
    const tool = getToolByPathOrThrow('/salary');
    const result = buildToolJsonLd(tool);
    const types = result['@graph'].map((n: Record<string, unknown>) => n['@type']);
    expect(types).toContain('FAQPage');
  });

  it('includes HowTo when tool has steps', () => {
    const tool = getToolByPathOrThrow('/loan');
    const result = buildToolJsonLd(tool);
    const types = result['@graph'].map((n: Record<string, unknown>) => n['@type']);
    expect(types).toContain('HowTo');
  });
});

describe('buildTopicJsonLd', () => {
  const input = {
    title: 'ابزارهای آنلاین فارسی',
    description: 'مجموعه کامل ابزارهای آنلاین فارسی',
    path: '/topics/test',
    categories: [
      {
        name: 'ابزارهای مالی',
        path: '/tools',
        tools: [
          { name: 'محاسبه حقوق', path: '/salary' },
          { name: 'محاسبه وام', path: '/loan' },
        ],
      },
    ],
  };

  it('returns correct structure', () => {
    const result = buildTopicJsonLd(input);
    expect(result['@context']).toBe('https://schema.org');
    expect(result['@graph']).toHaveLength(2);
  });

  it('includes CollectionPage', () => {
    const result = buildTopicJsonLd(input);
    const types = result['@graph'].map((n: Record<string, unknown>) => n['@type']);
    expect(types).toContain('CollectionPage');
    expect(types).toContain('ItemList');
  });

  it('includes FAQ when provided', () => {
    const withFaq = {
      ...input,
      faq: [{ question: 'سوال؟', answer: 'جواب' }],
    };
    const result = buildTopicJsonLd(withFaq);
    const types = result['@graph'].map((n: Record<string, unknown>) => n['@type']);
    expect(types).toContain('FAQPage');
  });

  it('positions items correctly', () => {
    const result = buildTopicJsonLd(input);
    const list = result['@graph'].find(
      (n: Record<string, unknown>) => n['@type'] === 'ItemList',
    ) as Record<string, unknown>;
    const elements = list['itemListElement'] as Array<Record<string, unknown>>;
    expect(elements[0]['position']).toBe(1);
    expect(elements[0]['name']).toBe('ابزارهای مالی');
  });
});

describe('buildPillarJsonLd', () => {
  const input = {
    title: 'ابزارهای مالی آنلاین',
    description: 'راهنمای کامل ابزارهای مالی',
    path: '/topics/finance',
    category: { name: 'ابزارهای مالی', path: '/tools' },
    tools: [
      { name: 'محاسبه حقوق', path: '/salary' },
      { name: 'محاسبه وام', path: '/loan' },
    ],
  };

  it('returns correct structure', () => {
    const result = buildPillarJsonLd(input);
    expect(result['@context']).toBe('https://schema.org');
    expect(result['@graph'].length).toBeGreaterThanOrEqual(2);
  });

  it('includes CollectionPage, BreadcrumbList and ItemList', () => {
    const result = buildPillarJsonLd(input);
    const types = result['@graph'].map((n: Record<string, unknown>) => n['@type']);
    expect(types).toContain('CollectionPage');
    expect(types).toContain('BreadcrumbList');
    expect(types).toContain('ItemList');
  });

  it('has 3 breadcrumb items', () => {
    const result = buildPillarJsonLd(input);
    const breadcrumbs = result['@graph'].find(
      (n: Record<string, unknown>) => n['@type'] === 'BreadcrumbList',
    ) as Record<string, unknown>;
    const items = breadcrumbs['itemListElement'] as Array<Record<string, unknown>>;
    expect(items).toHaveLength(3);
    expect(items[0]['name']).toBe('صفحه اصلی');
    expect(items[1]['name']).toBe('موضوعات و خوشه‌ها');
    expect(items[2]['name']).toBe('ابزارهای مالی');
  });

  it('includes FAQ when provided', () => {
    const withFaq = {
      ...input,
      faq: [{ question: 'سوال؟', answer: 'جواب' }],
    };
    const result = buildPillarJsonLd(withFaq);
    const types = result['@graph'].map((n: Record<string, unknown>) => n['@type']);
    expect(types).toContain('FAQPage');
  });
});
