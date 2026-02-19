export type GuidePage = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  faq: Array<{ question: string; answer: string }>;
  internalLinks: string[];
};

const editorialParagraph =
  'این راهنما با رویکرد محلی-اول نوشته شده و مثال‌های عملی، خطاهای رایج و مسیر تصمیم‌گیری روشن ارائه می‌دهد تا کاربر بتواند بدون وابستگی به سرویس خارجی، خروجی قابل اتکا بگیرد.';

export const guidePages: GuidePage[] = [
  'loan-planning-checklist',
  'salary-estimation-workflow',
  'interest-comparison-method',
  'pdf-merge-quality-checks',
  'pdf-compress-without-quality-loss',
  'date-conversion-validation',
  'offline-usage-best-practices',
  'privacy-local-first-guide',
  'tool-selection-decision-tree',
  'financial-scenario-versioning',
].map((slug, index) => ({
  slug,
  title: `راهنمای ${index + 1} - ${slug}`,
  summary: 'راهنمای عملی با مثال، FAQ و لینک داخلی برای افزایش کیفیت محتوای سئو.',
  body: `${editorialParagraph} ${editorialParagraph} ${editorialParagraph}`,
  faq: [
    { question: 'این راهنما برای چه کاری است؟', answer: 'برای اجرای سریع و دقیق سناریوهای واقعی.' },
    { question: 'آیا مثال عملی دارد؟', answer: 'بله، مثال‌های مرحله‌ای در متن آمده است.' },
  ],
  internalLinks: ['/tools', '/loan', '/salary'],
}));
