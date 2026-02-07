import { describe, expect, it } from 'vitest';
import { buildPillarJsonLd, buildToolJsonLd, buildTopicJsonLd } from '@/lib/seo-tools';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

type JsonLdNode = Record<string, unknown>;

function readGraph(jsonLd: JsonLdNode) {
  const graph = jsonLd['@graph'];
  expect(Array.isArray(graph)).toBe(true);
  return graph as JsonLdNode[];
}

describe('SEO JSON-LD contracts', () => {
  it('tool page json-ld includes required nodes for tool pages', () => {
    const tool = getToolByPathOrThrow('/pdf-tools/merge/merge-pdf');
    const jsonLd = buildToolJsonLd(tool) as JsonLdNode;
    const graph = readGraph(jsonLd);

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(graph.some((item) => item['@type'] === 'BreadcrumbList')).toBe(true);
    expect(graph.some((item) => item['@type'] === 'SoftwareApplication')).toBe(true);
    expect(graph.some((item) => item['@type'] === 'HowTo')).toBe(true);
  });

  it('category page json-ld does not emit empty FAQPage entities', () => {
    const categoryTool = getToolByPathOrThrow('/date-tools');
    const jsonLd = buildToolJsonLd(categoryTool) as JsonLdNode;
    const graph = readGraph(jsonLd);
    const faqNodes = graph.filter((item) => item['@type'] === 'FAQPage');

    faqNodes.forEach((faq) => {
      const mainEntity = faq['mainEntity'];
      expect(Array.isArray(mainEntity)).toBe(true);
      expect((mainEntity as unknown[]).length).toBeGreaterThan(0);
    });
  });

  it('topics hub json-ld includes collection + item list', () => {
    const jsonLd = buildTopicJsonLd({
      title: 'موضوعات و خوشه‌های ابزار - جعبه ابزار فارسی',
      description: 'نقشه موضوعی ابزارها',
      path: '/topics',
      categories: [
        {
          name: 'ابزارهای PDF',
          path: '/topics/pdf-tools',
          tools: [{ name: 'ادغام PDF', path: '/pdf-tools/merge/merge-pdf' }],
        },
      ],
      faq: [{ question: 'q', answer: 'a' }],
    }) as JsonLdNode;
    const graph = readGraph(jsonLd);

    expect(graph.some((item) => item['@type'] === 'CollectionPage')).toBe(true);
    expect(graph.some((item) => item['@type'] === 'ItemList')).toBe(true);
    expect(graph.some((item) => item['@type'] === 'FAQPage')).toBe(true);
  });

  it('topic category pillar json-ld includes breadcrumb + item list', () => {
    const jsonLd = buildPillarJsonLd({
      title: 'Pillar ابزارهای PDF - جعبه ابزار فارسی',
      description: 'دسترسی سریع به ابزارهای PDF',
      path: '/topics/pdf-tools',
      category: { name: 'ابزارهای PDF', path: '/pdf-tools' },
      tools: [{ name: 'ادغام PDF', path: '/pdf-tools/merge/merge-pdf' }],
      faq: [{ question: 'q', answer: 'a' }],
    }) as JsonLdNode;
    const graph = readGraph(jsonLd);

    expect(graph.some((item) => item['@type'] === 'CollectionPage')).toBe(true);
    expect(graph.some((item) => item['@type'] === 'BreadcrumbList')).toBe(true);
    expect(graph.some((item) => item['@type'] === 'ItemList')).toBe(true);
    expect(graph.some((item) => item['@type'] === 'FAQPage')).toBe(true);
  });
});
