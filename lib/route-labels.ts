/**
 * Route-label mapping for Persian breadcrumbs
 * Maps routes to human-friendly Persian labels for breadcrumb navigation
 */

interface RouteLabel {
  path: string;
  label: string;
}

/**
 * Route labels mapping
 * Provides Persian labels for common routes in the application
 */
const routeLabels: RouteLabel[] = [
  { path: '/', label: 'خانه' },
  { path: '/tools', label: 'ابزارهای مالی' },
  { path: '/pdf-tools', label: 'ابزارهای PDF' },
  { path: '/image-tools', label: 'ابزارهای تصویر' },
  { path: '/date-tools', label: 'ابزارهای تاریخ' },
  { path: '/text-tools', label: 'ابزارهای متنی' },
  { path: '/validation-tools', label: 'ابزارهای اعتبارسنجی' },
  { path: '/search', label: 'جستجو' },
  { path: '/about', label: 'درباره ما' },
  { path: '/guides', label: 'راهنماها' },
  { path: '/topics', label: 'موضوعات' },
  { path: '/services', label: 'خدمات' },
  { path: '/how-it-works', label: 'نحوه کار' },
  { path: '/privacy', label: 'حریم خصوصی' },
  { path: '/terms', label: 'قوانین و مقررات' },
  { path: '/contact', label: 'تماس با ما' },
  { path: '/support', label: 'پشتیبانی' },
  { path: '/brand', label: 'برند' },
  { path: '/case-studies', label: 'مطالعات موردی' },
  { path: '/developers', label: 'توسعه‌دهندگان' },
  { path: '/plans', label: 'طرح‌ها' },
  { path: '/pro', label: 'نسخه حرفه‌ای' },
  { path: '/account', label: 'حساب کاربری' },
  { path: '/dashboard', label: 'داشبورد' },
];

/**
 * Get label for a specific route
 * Returns the Persian label for a given route, or the route path itself if no label exists
 */
export function getRouteLabel(path: string): string {
  const exactMatch = routeLabels.find((route) => route.path === path);
  if (exactMatch) {
    return exactMatch.label;
  }

  // Try to find a partial match for dynamic routes
  const partialMatch = routeLabels.find(
    (route) => path.startsWith(route.path) && route.path !== '/',
  );
  if (partialMatch) {
    return partialMatch.label;
  }

  // Fallback to path segment
  const segments = path.split('/').filter(Boolean);
  if (segments.length > 0) {
    return segments[segments.length - 1] ?? path;
  }

  return path;
}

/**
 * Get breadcrumb items for a given route
 * Returns an array of breadcrumb items with labels and URLs
 */
interface BreadcrumbItem {
  label: string;
  href: string;
}

export function getBreadcrumbs(path: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  const segments = path.split('/').filter(Boolean);

  // Always add home
  breadcrumbs.push({
    label: getRouteLabel('/'),
    href: '/',
  });

  // Build path incrementally
  let currentPath = '';
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const label = getRouteLabel(currentPath);

    // Don't add the current page as a breadcrumb (it's the page title)
    if (i < segments.length - 1) {
      breadcrumbs.push({
        label,
        href: currentPath,
      });
    }
  }

  return breadcrumbs;
}

/**
 * Get category-specific breadcrumb labels
 * Provides labels for tool categories and sub-paths
 */
export function getCategoryLabel(categoryId: string): string {
  const categoryLabels: Record<string, string> = {
    'pdf-tools': 'ابزارهای PDF',
    'image-tools': 'ابزارهای تصویر',
    'date-tools': 'ابزارهای تاریخ',
    'text-tools': 'ابزارهای متنی',
    'finance-tools': 'ابزارهای مالی',
    'validation-tools': 'ابزارهای اعتبارسنجی',
  };

  return categoryLabels[categoryId] ?? categoryId;
}
