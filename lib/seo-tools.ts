import { siteName, siteUrl } from '@/lib/seo';
import { getToolsByCategory } from '@/lib/tools-registry';
import type { ToolEntry } from '@/lib/tools-registry';

type JsonLdNode = Record<string, unknown>;

const lang = 'fa-IR';

export function buildToolJsonLd(tool: ToolEntry): JsonLdNode {
  const graphs: JsonLdNode[] = [];
  const absoluteUrl = new URL(tool.path, siteUrl).toString();
  const cleanTitle = tool.title.replace(' - جعبه ابزار فارسی', '');

  graphs.push({
    '@type': 'BreadcrumbList',
    itemListElement: buildBreadcrumbItems(tool),
  });

  if (tool.kind === 'tool') {
    graphs.push({
      '@type': 'SoftwareApplication',
      name: cleanTitle,
      description: tool.description,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      url: absoluteUrl,
      isAccessibleForFree: true,
      inLanguage: lang,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'IRR',
      },
      publisher: {
        '@type': 'Organization',
        name: siteName,
        url: siteUrl,
      },
    });

    graphs.push({
      '@type': 'WebApplication',
      name: cleanTitle,
      description: tool.description,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      url: absoluteUrl,
      inLanguage: lang,
      isAccessibleForFree: true,
    });
  }

  if (tool.kind === 'category') {
    const tools = getToolsByCategory(tool.category?.id ?? tool.id);
    const categoryFaq = tool.content?.faq ?? [];
    if (tools.length > 0) {
      const itemListElements = tools.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.title.replace(' - جعبه ابزار فارسی', ''),
        url: new URL(item.path, siteUrl).toString(),
      }));

      graphs.push({
        '@type': 'ItemList',
        name: tool.title.replace(' - جعبه ابزار فارسی', ''),
        itemListOrder: 'https://schema.org/ItemListUnordered',
        itemListElement: itemListElements,
      });

      graphs.push({
        '@type': 'ItemList',
        name: `${tool.title.replace(' - جعبه ابزار فارسی', '')} (Nested)`,
        itemListOrder: 'https://schema.org/ItemListUnordered',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: tool.title.replace(' - جعبه ابزار فارسی', ''),
            url: absoluteUrl,
            item: {
              '@type': 'ItemList',
              name: tool.title.replace(' - جعبه ابزار فارسی', ''),
              itemListOrder: 'https://schema.org/ItemListUnordered',
              itemListElement: itemListElements,
            },
          },
        ],
      });
    }

    if (categoryFaq.length > 0) {
      graphs.push({
        '@type': 'FAQPage',
        mainEntity: categoryFaq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      });
    }
  }

  if (tool.kind === 'hub') {
    graphs.push({
      '@type': 'CollectionPage',
      name: cleanTitle,
      description: tool.description,
      url: absoluteUrl,
      inLanguage: lang,
    });

    const financeTools = getToolsByCategory('finance-tools');
    if (financeTools.length > 0) {
      graphs.push({
        '@type': 'ItemList',
        name: `${cleanTitle} - ابزارهای مالی`,
        itemListOrder: 'https://schema.org/ItemListUnordered',
        itemListElement: financeTools.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.title.replace(' - جعبه ابزار فارسی', ''),
          url: new URL(item.path, siteUrl).toString(),
        })),
      });
    }
  }

  if (tool.content?.faq && tool.content.faq.length > 0) {
    graphs.push({
      '@type': 'FAQPage',
      mainEntity: tool.content.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  if (tool.kind === 'tool' && tool.content?.steps && tool.content.steps.length > 0) {
    graphs.push({
      '@type': 'HowTo',
      name: tool.title.replace(' - جعبه ابزار فارسی', ''),
      description: tool.description,
      inLanguage: lang,
      step: tool.content.steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step,
        text: step,
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graphs,
  };
}

export function buildTopicJsonLd(input: {
  title: string;
  description: string;
  path: string;
  categories: Array<{
    name: string;
    path: string;
    tools: Array<{ name: string; path: string }>;
  }>;
  faq?: Array<{ question: string; answer: string }>;
}): JsonLdNode {
  const absoluteUrl = new URL(input.path, siteUrl).toString();
  const itemList: JsonLdNode[] = input.categories.map((category, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: category.name,
    url: new URL(category.path, siteUrl).toString(),
    item: {
      '@type': 'ItemList',
      name: category.name,
      itemListOrder: 'https://schema.org/ItemListUnordered',
      itemListElement: category.tools.map((tool, toolIndex) => ({
        '@type': 'ListItem',
        position: toolIndex + 1,
        name: tool.name,
        url: new URL(tool.path, siteUrl).toString(),
      })),
    },
  }));

  const graph: JsonLdNode[] = [
    {
      '@type': 'CollectionPage',
      name: input.title,
      description: input.description,
      url: absoluteUrl,
      inLanguage: lang,
    },
    {
      '@type': 'ItemList',
      name: input.title,
      itemListOrder: 'https://schema.org/ItemListUnordered',
      itemListElement: itemList,
    },
  ];

  if (input.faq && input.faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: input.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

export function buildPillarJsonLd(input: {
  title: string;
  description: string;
  path: string;
  category: { name: string; path: string };
  tools: Array<{ name: string; path: string }>;
  faq?: Array<{ question: string; answer: string }>;
}): JsonLdNode {
  const absoluteUrl = new URL(input.path, siteUrl).toString();

  const graph: JsonLdNode[] = [
    {
      '@type': 'CollectionPage',
      name: input.title,
      description: input.description,
      url: absoluteUrl,
      inLanguage: lang,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'صفحه اصلی',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'موضوعات و خوشه‌ها',
          item: new URL('/topics', siteUrl).toString(),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: input.category.name,
          item: new URL(input.category.path, siteUrl).toString(),
        },
      ],
    },
    {
      '@type': 'ItemList',
      name: input.category.name,
      itemListOrder: 'https://schema.org/ItemListUnordered',
      itemListElement: input.tools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.name,
        url: new URL(tool.path, siteUrl).toString(),
      })),
    },
  ];

  if (input.faq && input.faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: input.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

function buildBreadcrumbItems(tool: ToolEntry): JsonLdNode[] {
  const items: JsonLdNode[] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'صفحه اصلی',
      item: siteUrl,
    },
  ];

  let position = 2;

  if (tool.category) {
    items.push({
      '@type': 'ListItem',
      position,
      name: tool.category.name,
      item: new URL(tool.category.path, siteUrl).toString(),
    });
    position += 1;
  }

  items.push({
    '@type': 'ListItem',
    position,
    name: tool.title.replace(' - جعبه ابزار فارسی', ''),
    item: new URL(tool.path, siteUrl).toString(),
  });

  return items;
}
