import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';
import { getCategories, getIndexableTools, getToolByPath } from '@/lib/tools-registry';

export default function sitemap(): MetadataRoute.Sitemap {
  const buildDate = process.env['NEXT_PUBLIC_BUILD_DATE'] ?? new Date().toISOString().slice(0, 10);
  const staticRoutes = ['/', '/topics', '/about', '/how-it-works', '/privacy'];
  const categoryRoutes = getCategories().map((category) => `/topics/${category.id}`);
  const routes = [
    ...staticRoutes,
    ...categoryRoutes,
    ...getIndexableTools().map((tool) => tool.path),
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

  return routes.map((route) => ({
    url: new URL(route, siteUrl).toString(),
    lastModified:
      toolLastModified.get(route) ??
      categoryLastModified.get(route) ??
      staticLastModified.get(route) ??
      getToolByPath(route)?.lastModified ??
      buildDate,
  }));
}
