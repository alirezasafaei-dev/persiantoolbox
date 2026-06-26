import dynamic from 'next/dynamic';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';

const CareerWizard = dynamic(() => import('@/components/features/career-documents/CareerWizard'), {
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="animate-pulse text-[var(--text-muted)] text-sm">
        در حال بارگذاری استودیو...
      </div>
    </div>
  ),
});

export const metadata = buildMetadata({
  title: 'رزومه ساز حرفه‌ای | ساخت رزومه فارسی و انگلیسی',
  description:
    'ساخت رزومه فارسی و انگلیسی به صورت آنلاین و رایگان. کاورلتر ساز حرفه‌ای با خروجی PDF و Word.',
  path: '/career-tools/resume-builder',
  keywords: ['ساخت رزومه', 'رزومه آنلاین', 'رزومه فارسی', 'ساخت CV', 'رزومه PDF', 'کاورلتر ساز'],
});

export default function ResumeBuilderPage() {
  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="resume-builder-breadcrumb"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'خانه', item: siteUrl },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'ابزارهای شغلی',
                item: `${siteUrl}/career-tools`,
              },
              { '@type': 'ListItem', position: 3, name: 'رزومه ساز' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای شغلی', url: `${siteUrl}/career-tools` },
          { name: 'رزومه ساز', url: `${siteUrl}/career-tools/resume-builder` },
        ]}
      />
      <div className="max-w-3xl mx-auto">
        <CareerWizard />
      </div>
    </SiteShell>
  );
}
