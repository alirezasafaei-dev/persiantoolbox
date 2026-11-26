import Breadcrumbs from '@/components/ui/Breadcrumbs';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import RelatedTools from '@/components/ui/RelatedTools';
import WordToPdfGuide from '@/features/pdf-tools/convert/word-to-pdf';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const guide = getToolByPathOrThrow('/pdf-tools/convert/word-to-pdf');
const breadcrumbs = [
  { label: 'خانه', href: '/' },
  { label: 'ابزارهای PDF', href: '/pdf-tools' },
  { label: 'راهنمای تبدیل Word به PDF', href: guide.path },
];

export const metadata = buildMetadata({
  title: guide.title,
  description: guide.description,
  keywords: guide.keywords,
  path: guide.path,
});

export default function WordToPdfRoute() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-4 md:py-8">
      <BreadcrumbSchema
        items={breadcrumbs.map(({ label, href }) => ({ name: label, url: `${siteUrl}${href}` }))}
      />
      <Breadcrumbs
        items={breadcrumbs.map((item) => ({ ...item, current: item.href === guide.path }))}
      />
      <WordToPdfGuide />
      {guide.category ? <RelatedTools currentPath={guide.path} category={guide.category} /> : null}
    </div>
  );
}
