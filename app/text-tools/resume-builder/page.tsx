import SiteShell from '@/components/ui/SiteShell';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { buildMetadata, siteUrl } from '@/lib/seo';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const ResumeBuilder = dynamic(
  () => import('@/components/features/text-tools/ResumeBuilder').then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

export const metadata: Metadata = buildMetadata({
  title: 'ساخت رزومه آنلاین رایگان - جعبه ابزار فارسی',
  description:
    'رزومه حرفه‌ای خود را به صورت آنلاین و رایگان بسازید. خروجی PDF با طراحی زیبا و RTL.',
  path: '/text-tools/resume-builder',
  keywords: ['ساخت رزومه', 'رزومه آنلاین', 'رزومه فارسی', 'رزومه رایگان', 'ساخت CV', 'رزومه PDF'],
});

export default function ResumeBuilderPage() {
  return (
    <SiteShell containerClassName="py-10">
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای متنی', url: `${siteUrl}/text-tools` },
          { name: 'ساخت رزومه آنلاین' },
        ]}
      />
      <ResumeBuilder />
    </SiteShell>
  );
}
