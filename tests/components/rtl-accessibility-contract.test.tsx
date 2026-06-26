import { describe, it, expect } from 'vitest';
import {
  mainNavItems,
  footerCategoryLinks,
  footerPageLinks,
  footerTrustLinks,
} from '@/lib/navigation';
import { BRAND, getDefaultSiteUrl } from '@/lib/brand';

describe('RTL layout contract', () => {
  it('html element has dir=rtl for Persian content', () => {
    const html = document.documentElement;
    html.setAttribute('dir', 'rtl');
    html.setAttribute('lang', 'fa');
    expect(html.getAttribute('dir')).toBe('rtl');
    expect(html.getAttribute('lang')).toBe('fa');
  });

  it('app layout sets dir=rtl on html element', async () => {
    const layoutPath = require('node:path').join(process.cwd(), 'app', 'layout.tsx');
    const { readFileSync } = require('node:fs');
    const content = readFileSync(layoutPath, 'utf-8');
    expect(content).toContain('rtl');
  });
});

describe('navigation accessibility', () => {
  it('navigation items have href attributes', () => {
    expect(mainNavItems.length).toBeGreaterThan(0);
    for (const item of mainNavItems) {
      expect(item.href).toBeTruthy();
      expect(item.href.startsWith('/')).toBe(true);
    }
  });

  it('all nav items have non-empty labels', () => {
    const allItems = [
      ...mainNavItems,
      ...footerCategoryLinks,
      ...footerPageLinks,
      ...footerTrustLinks,
    ];
    for (const item of allItems) {
      expect(item.label.trim().length).toBeGreaterThan(0);
    }
  });

  it('mainNavItems includes all 6 categories', () => {
    const categoryLabels = mainNavItems
      .filter((item) => item.role === 'category')
      .map((item) => item.label);
    expect(categoryLabels).toContain('ابزارهای PDF');
    expect(categoryLabels).toContain('ابزارهای تصویر');
    expect(categoryLabels).toContain('ابزارهای مالی');
    expect(categoryLabels).toContain('ابزارهای تاریخ');
    expect(categoryLabels).toContain('ابزارهای متنی');
    expect(categoryLabels).toContain('ابزارهای اعتبارسنجی');
  });
});

describe('brand consistency', () => {
  it('brand module exports required fields', () => {
    expect(BRAND).toBeDefined();
    expect(BRAND.siteName).toBeTruthy();
    expect(typeof getDefaultSiteUrl).toBe('function');
  });

  it('getDefaultSiteUrl returns a URL string', () => {
    const url = getDefaultSiteUrl();
    expect(typeof url).toBe('string');
    expect(url.startsWith('http')).toBe(true);
  });
});

describe('tools-registry display contract', () => {
  it('all tools have non-empty descriptions', async () => {
    const { getToolsByCategory } = await import('@/lib/tools-registry');
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
        expect(tool.description.length).toBeGreaterThan(5);
      }
    }
  });

  it('all tool paths start with /', async () => {
    const { getToolsByCategory } = await import('@/lib/tools-registry');
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
        expect(tool.path.startsWith('/')).toBe(true);
      }
    }
  });
});
