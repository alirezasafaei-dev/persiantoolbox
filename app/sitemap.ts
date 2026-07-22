import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';
import { getCategories, getIndexableTools } from '@/lib/tools-registry';
import { guidePages } from '@/lib/guide-pages';
import {
  getAllPosts,
  getAllCategories as getBlogCategories,
  getIndexableTagsForStaticParams as getBlogTags,
} from '@/lib/blog';

export const revalidate = 300;

const REDIRECTED_TOPIC_CATEGORY_IDS = new Set([
  'pdf-tools',
  'image-tools',
  'date-tools',
  'text-tools',
  'finance-tools',
]);

const latestDate = (values: Array<string | undefined>): string | undefined =>
  values
    .filter((value): value is string => Boolean(value))
    .sort()
    .pop();

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPosts = getAllPosts();
  const blogCategories = getBlogCategories();
  const blogTags = getBlogTags();
  const blogCategoryRoutes = blogCategories.map((category) => `/blog/category/${category}`);
  const blogPostRoutes = blogPosts.map((post) => `/blog/${post.slug}`);
  const blogTagRoutes = blogTags.map((tag) => `/blog/tag/${tag}`);
  const staticRoutes = [
    '/',
    '/blog',
    '/compare',
    '/use-cases',
    '/guides',
    '/market',
    '/market/currency-rates',
    '/market/gold-prices',
    '/topics',
    '/about',
    '/asdev',
    '/brand',
    '/case-studies',
    '/compatibility',
    '/developers',
    '/developers/api',
    '/developers/api/market',
    '/developers/api/salary-laws',
    '/developers/api/status',
    '/docs/api',
    '/how-it-works',
    '/pricing',
    '/privacy',
    '/refer',
    '/services',
    '/support',
    '/terms',
    '/tools/specialized',
    '/trust',
    '/pdf-tools/uses',
    '/business-tools',
    '/business-tools/document-studio',
    '/career-tools',
    '/career-tools/resume-builder',
    '/writing-tools',
    '/writing-tools/persian-writing-studio',
  ];
  const categoryRoutes = getCategories()
    .filter((category) => !REDIRECTED_TOPIC_CATEGORY_IDS.has(category.id))
    .map((category) => `/topics/${category.id}`);
  const guideRoutes = guidePages.map((guide) => `/guides/${guide.slug}`);
  const indexableTools = getIndexableTools();
  const routes = [
    ...new Set([
      ...staticRoutes,
      ...categoryRoutes,
      ...guideRoutes,
      ...blogCategoryRoutes,
      ...blogPostRoutes,
      ...blogTagRoutes,
      ...indexableTools.map((tool) => tool.path),
    ]),
  ];

  const categoryLastModified = new Map<string, string | undefined>(
    getCategories().map((category) => {
      const modified = latestDate(
        indexableTools
          .filter((tool) => tool.category?.id === category.id)
          .map((tool) => tool.lastModified),
      );
      return [`/topics/${category.id}`, modified] as const;
    }),
  );
  const toolLastModified = new Map<string, string>(
    indexableTools
      .filter((tool): tool is typeof tool & { lastModified: string } => Boolean(tool.lastModified))
      .map((tool) => [tool.path, tool.lastModified] as const),
  );
  const blogPostLastModified = new Map<string, string>(
    blogPosts.map((post) => [`/blog/${post.slug}`, post.modifiedDate || post.date] as const),
  );
  const blogCategoryLastModified = new Map<string, string | undefined>(
    blogCategories.map(
      (category) =>
        [
          `/blog/category/${category}`,
          latestDate(
            blogPosts
              .filter((post) => post.category === category)
              .map((post) => post.modifiedDate || post.date),
          ),
        ] as const,
    ),
  );
  const blogTagLastModified = new Map<string, string | undefined>(
    blogTags.map(
      (tag) =>
        [
          `/blog/tag/${tag}`,
          latestDate(
            blogPosts
              .filter((post) => post.tags.includes(tag))
              .map((post) => post.modifiedDate || post.date),
          ),
        ] as const,
    ),
  );
  const blogIndexLastModified = latestDate(blogPosts.map((post) => post.modifiedDate || post.date));

  const GOLDEN_TOOLS = new Set(['/salary', '/loan', '/interest']);

  const getPriority = (route: string): number => {
    if (route === '/') {
      return 1.0;
    }
    if (
      GOLDEN_TOOLS.has(route) ||
      route.startsWith('/pdf-tools') ||
      route.startsWith('/tools') ||
      route.startsWith('/validation-tools')
    ) {
      return 0.8;
    }
    if (route.startsWith('/developers/api/')) {
      return 0.7;
    }
    if (
      route.startsWith('/image-tools') ||
      route.startsWith('/date-tools') ||
      route.startsWith('/text-tools')
    ) {
      return 0.7;
    }
    if (route.startsWith('/topics/')) {
      return 0.6;
    }
    if (route.startsWith('/guides')) {
      return 0.5;
    }
    if (route.startsWith('/blog/')) {
      const slug = route.replace('/blog/', '');
      const post = blogPosts.find((item) => item.slug === slug);
      if (post) {
        const tagScore = Math.min(post.tags.length * 0.02, 0.1);
        return 0.5 + tagScore;
      }
      return 0.5;
    }
    if (route === '/blog') {
      return 0.7;
    }
    if (route === '/pricing' || route.startsWith('/developers')) {
      return 0.5;
    }
    return 0.4;
  };

  const getChangeFrequency = (route: string): 'daily' | 'weekly' | 'monthly' | 'yearly' => {
    if (route === '/') {
      return 'daily';
    }
    if (route.startsWith('/pdf-tools') || route.startsWith('/tools')) {
      return 'weekly';
    }
    if (route.startsWith('/developers/api/')) {
      return 'monthly';
    }
    if (
      route.startsWith('/image-tools') ||
      route.startsWith('/date-tools') ||
      route.startsWith('/text-tools')
    ) {
      return 'weekly';
    }
    if (route.startsWith('/topics/')) {
      return 'monthly';
    }
    if (route.startsWith('/guides')) {
      return 'monthly';
    }
    if (route.startsWith('/blog/')) {
      const slug = route.replace('/blog/', '');
      const post = blogPosts.find((item) => item.slug === slug);
      if (post) {
        const daysSincePublished = Math.floor(
          (Date.now() - new Date(post.date).getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysSincePublished < 30) {
          return 'weekly';
        }
        if (daysSincePublished < 90) {
          return 'monthly';
        }
      }
      return 'monthly';
    }
    if (route === '/blog') {
      return 'daily';
    }
    return 'yearly';
  };

  return routes.map((route) => {
    const lastModified =
      toolLastModified.get(route) ??
      blogPostLastModified.get(route) ??
      blogCategoryLastModified.get(route) ??
      blogTagLastModified.get(route) ??
      categoryLastModified.get(route) ??
      (route === '/blog' ? blogIndexLastModified : undefined);

    return {
      url: new URL(route, siteUrl).toString(),
      ...(lastModified ? { lastModified } : {}),
      priority: getPriority(route),
      changeFrequency: getChangeFrequency(route),
    };
  });
}
