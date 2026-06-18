import { describe, expect, it } from 'vitest';
import { getRouteLabel, getBreadcrumbs, getCategoryLabel } from '@/lib/route-labels';

describe('route-labels', () => {
  describe('getRouteLabel', () => {
    it('returns Persian label for known routes', () => {
      expect(getRouteLabel('/')).toBe('خانه');
      expect(getRouteLabel('/tools')).toBe('ابزارهای مالی');
      expect(getRouteLabel('/pdf-tools')).toBe('ابزارهای PDF');
      expect(getRouteLabel('/image-tools')).toBe('ابزارهای تصویر');
      expect(getRouteLabel('/date-tools')).toBe('ابزارهای تاریخ');
      expect(getRouteLabel('/text-tools')).toBe('ابزارهای متنی');
      expect(getRouteLabel('/search')).toBe('جستجو');
    });

    it('returns path segment for unknown routes', () => {
      expect(getRouteLabel('/unknown-route')).toBe('unknown-route');
    });

    it('handles partial matches for dynamic routes', () => {
      const label = getRouteLabel('/pdf-tools/some-sub-page');
      expect(label).toBe('ابزارهای PDF');
    });
  });

  describe('getBreadcrumbs', () => {
    it('returns home breadcrumb for root path', () => {
      const breadcrumbs = getBreadcrumbs('/');
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0]).toEqual({
        label: 'خانه',
        href: '/',
      });
    });

    it('returns breadcrumbs for simple route', () => {
      const breadcrumbs = getBreadcrumbs('/tools');
      expect(breadcrumbs).toHaveLength(1); // Only home, current page is excluded
      expect(breadcrumbs[0]).toEqual({
        label: 'خانه',
        href: '/',
      });
    });

    it('returns breadcrumbs for nested route', () => {
      const breadcrumbs = getBreadcrumbs('/pdf-tools/compress');
      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs[0]).toEqual({
        label: 'خانه',
        href: '/',
      });
      expect(breadcrumbs[1]).toBeDefined();
      expect(breadcrumbs[1]?.label).toBe('ابزارهای PDF');
      expect(breadcrumbs[1]?.href).toBe('/pdf-tools');
    });

    it('uses Persian labels in breadcrumbs', () => {
      const breadcrumbs = getBreadcrumbs('/pdf-tools/compress/compress-pdf');
      expect(breadcrumbs[0]?.label).toBe('خانه');
      expect(breadcrumbs[1]?.label).toBe('ابزارهای PDF');
    });
  });

  describe('getCategoryLabel', () => {
    it('returns Persian label for known categories', () => {
      expect(getCategoryLabel('pdf-tools')).toBe('ابزارهای PDF');
      expect(getCategoryLabel('image-tools')).toBe('ابزارهای تصویر');
      expect(getCategoryLabel('date-tools')).toBe('ابزارهای تاریخ');
      expect(getCategoryLabel('text-tools')).toBe('ابزارهای متنی');
      expect(getCategoryLabel('finance-tools')).toBe('ابزارهای مالی');
      expect(getCategoryLabel('validation-tools')).toBe('ابزارهای اعتبارسنجی');
    });

    it('returns category ID for unknown categories', () => {
      expect(getCategoryLabel('unknown-category')).toBe('unknown-category');
    });
  });
});
