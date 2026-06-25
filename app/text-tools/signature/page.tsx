import SiteShell from '@/components/ui/SiteShell';
import type { Metadata } from 'next';
import { buildMetadata, siteUrl } from '@/lib/seo';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import SignatureTool from '@/components/features/text-tools/SignatureTool';

export const metadata: Metadata = buildMetadata({
  title: 'ابزار امضای آنلاین رایگان - جعبه ابزار فارسی',
  description:
    'امضای دیجیتال خود را به صورت آنلاین بکشید و دانلود کنید. خروجی PNG با پس‌زمینه شفاف.',
  path: '/text-tools/signature',
  keywords: ['امضای آنلاین', 'امضای دیجیتال', 'signature online', 'امضای رایگان'],
});

export default function SignaturePage() {
  return (
    <SiteShell containerClassName="py-10">
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای متنی', url: `${siteUrl}/text-tools` },
          { name: 'امضای آنلاین' },
        ]}
      />
      <SignatureTool />
    </SiteShell>
  );
}
