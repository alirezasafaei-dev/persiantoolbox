import { describe, expect, it } from 'vitest';
import { buildToolJsonLd, buildTopicJsonLd } from '@/lib/seo-tools';
import { getToolByPathOrThrow, getCategoryContent } from '@/lib/tools-registry';

describe('seo-tools', () => {
  it('adds SoftwareApplication and HowTo for tool pages', () => {
    const tool = getToolByPathOrThrow('/pdf-tools/merge/merge-pdf');
    const jsonLd = buildToolJsonLd(tool);
    const graph = jsonLd['@graph'] as Array<Record<string, unknown>>;

    const software = graph.find((item) => item['@type'] === 'SoftwareApplication');
    const webApplication = graph.find((item) => item['@type'] === 'WebApplication');
    const howTo = graph.find((item) => item['@type'] === 'HowTo');

    expect(software).toBeTruthy();
    expect(webApplication).toBeTruthy();
    expect(howTo).toBeTruthy();
  });

  it('adds ItemList and FAQPage for category pages', () => {
    const categoryTool = getToolByPathOrThrow('/pdf-tools');
    const jsonLd = buildToolJsonLd(categoryTool);
    const graph = jsonLd['@graph'] as Array<Record<string, unknown>>;

    const itemList = graph.find((item) => item['@type'] === 'ItemList');
    const faq = graph.find((item) => item['@type'] === 'FAQPage');

    expect(itemList).toBeTruthy();
    expect(faq).toBeTruthy();
  });

  it('builds topic json-ld with FAQ when provided', () => {
    const categoryContent = getCategoryContent('pdf-tools');
    const jsonLd = buildTopicJsonLd({
      title: 'موضوعات و خوشه‌های ابزار - جعبه ابزار فارسی',
      description: 'نقشه موضوعی ابزارها و خوشه‌های مرتبط برای دسترسی سریع‌تر',
      path: '/topics',
      categories: [
        {
          name: 'ابزارهای PDF',
          path: '/topics/pdf-tools',
          tools: [
            {
              name: 'ادغام PDF',
              path: '/pdf-tools/merge/merge-pdf',
            },
          ],
        },
      ],
      faq: categoryContent?.faq ?? [],
    });

    const graph = jsonLd['@graph'] as Array<Record<string, unknown>>;
    const faq = graph.find((item) => item['@type'] === 'FAQPage');

    expect(faq).toBeTruthy();
  });

  it('adds CollectionPage and ItemList for finance hub page', () => {
    const hub = getToolByPathOrThrow('/tools');
    const jsonLd = buildToolJsonLd(hub);
    const graph = jsonLd['@graph'] as Array<Record<string, unknown>>;

    const collection = graph.find((item) => item['@type'] === 'CollectionPage');
    const list = graph.find((item) => item['@type'] === 'ItemList');

    expect(collection).toBeTruthy();
    expect(list).toBeTruthy();
  });
});
