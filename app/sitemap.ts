import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';
import { getCategories, getIndexableTools, getToolByPath } from '@/lib/tools-registry';
import { guidePages } from '@/lib/guide-pages';
import {
  getAllPosts,
  getAllCategories as getBlogCategories,
  getIndexableTagsForStaticParams as getBlogTags,
} from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const buildDate = process.env['NEXT_PUBLIC_BUILD_DATE'] ?? new Date().toISOString().slice(0, 10);
  const blogPosts = getAllPosts();
  const blogCategoryRoutes = getBlogCategories().map((cat) => `/blog/category/${cat}`);
  const blogPostRoutes = blogPosts.map((post) => `/blog/${post.slug}`);
  const blogTagRoutes = getBlogTags().map((tag) => `/blog/tag/${tag}`);
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
  const categoryRoutes = getCategories().map((category) => `/topics/${category.id}`);
  const guideRoutes = guidePages.map((guide) => `/guides/${guide.slug}`);
  const routes = [
    ...new Set([
      ...staticRoutes,
      ...categoryRoutes,
      ...guideRoutes,
      ...blogCategoryRoutes,
      ...blogPostRoutes,
      ...blogTagRoutes,
      ...getIndexableTools().map((tool) => tool.path),
    ]),
  ];

  const indexableTools = getIndexableTools();
  const categoryLastModified = new Map(
    getCategories().map((category) => {
      const categoryTools = indexableTools.filter((tool) => tool.category?.id === category.id);
      const latest = categoryTools
        .map((tool) => tool.lastModified ?? buildDate)
        .sort()
        .pop();
      return [`/topics/${category.id}`, latest ?? buildDate];
    }),
  );
  const staticLastModified = new Map(
    staticRoutes.map((route) => {
      if (route === '/') {
        return [route, buildDate];
      }
      return [route, buildDate];
    }),
  );
  const toolLastModified = new Map(
    indexableTools.map((tool) => [tool.path, tool.lastModified ?? buildDate]),
  );
  const guideLastModified = new Map(
    guidePages.map((guide) => [`/guides/${guide.slug}`, buildDate]),
  );
  const blogPostLastModified = new Map(
    blogPosts.map((post) => [`/blog/${post.slug}`, post.modifiedDate || post.date]),
  );
  const blogCategoryLastModified = new Map(blogCategoryRoutes.map((route) => [route, buildDate]));

  // Priority and change frequency configuration
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
      const post = blogPosts.find((p) => p.slug === slug);
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
      const post = blogPosts.find((p) => p.slug === slug);
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

  return routes.map((route) => ({
    url: new URL(route, siteUrl).toString(),
    lastModified:
      toolLastModified.get(route) ??
      guideLastModified.get(route) ??
      blogPostLastModified.get(route) ??
      blogCategoryLastModified.get(route) ??
      categoryLastModified.get(route) ??
      staticLastModified.get(route) ??
      getToolByPath(route)?.lastModified ??
      buildDate,
    priority: getPriority(route),
    changeFrequency: getChangeFrequency(route),
  }));
}
