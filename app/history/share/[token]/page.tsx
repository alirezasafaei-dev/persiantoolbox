import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import { isFeatureEnabled } from '@/lib/features/availability';
import ShareContent from './ShareContent';

type PageProps = {
  params: Promise<{ token: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!isFeatureEnabled('history-share')) {
    return { title: 'غیرفعال', robots: { index: false, follow: false } };
  }
  const { token } = await params;
  return buildMetadata({
    title: 'اشتراک‌گذاری تاریخچه - جعبه ابزار فارسی',
    description: 'مشاهده نتیجه اشتراک‌گذاری شده از تاریخچه عملیات',
    path: `/history/share/${token}`,
    robots: { index: false, follow: false },
  });
}

export default async function SharePage({ params }: PageProps) {
  const { token } = await params;

  if (!isFeatureEnabled('history-share')) {
    notFound();
  }

  return (
    <SiteShell containerClassName="py-10">
      <ShareContent token={token} />
    </SiteShell>
  );
}
