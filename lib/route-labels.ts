import { getIndexableTools } from '@/lib/tools-registry';

const staticRouteLabels: Record<string, string> = {
  tools: 'ابزارها',
  specialized: 'ابزارهای تخصصی',
  merge: 'ادغام',
  compress: 'فشرده‌سازی',
  split: 'تقسیم',
  convert: 'تبدیل',
  edit: 'ویرایش',
  extract: 'استخراج',
  security: 'امنیت',
  paginate: 'شماره‌گذاری',
  watermark: 'واترمارک',
};

function cleanTitle(title: string): string {
  return title.replace(' - جعبه ابزار فارسی', '');
}

export function buildToolRouteLabelMap(): Record<string, string> {
  return getIndexableTools().reduce<Record<string, string>>((labels, tool) => {
    labels[tool.path] = cleanTitle(tool.title);
    if (tool.category) {
      labels[tool.category.path] = tool.category.name;
    }
    return labels;
  }, {});
}

export function getStaticRouteLabel(segment: string): string {
  return staticRouteLabels[segment] ?? segment.replace(/-/g, ' ');
}
