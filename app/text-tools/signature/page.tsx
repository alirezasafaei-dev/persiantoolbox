import SiteShell from '@/components/ui/SiteShell';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { buildMetadata, siteUrl } from '@/lib/seo';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const SignatureTool = dynamic(
  () => import('@/components/features/text-tools/SignatureTool').then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-96 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

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
