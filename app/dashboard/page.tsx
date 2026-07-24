import { redirect } from 'next/navigation';
import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import SiteShell from '@/components/ui/SiteShell';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';
import { getUserFromRequest } from '@/lib/server/auth';
import OpsDashboardClient from '@/components/features/admin/OpsDashboardClient';

export const metadata = featurePageMetadata('dashboard', {
  title: 'داشبورد - جعبه ابزار فارسی',
  description:
    'داشبورد مدیریتی برای مشاهده آمار استفاده از ابزارها، عملکرد سیستم و مدیریت محتوای جعبه ابزار فارسی.',
});

export default async function UsageDashboardRoute() {
  if (!isFeatureEnabled('dashboard')) {
    return (
      <SiteShell>
        <FeatureDisabledPage feature="dashboard" />
      </SiteShell>
    );
  }

  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('pt_session')?.value;
  if (!sessionToken) {
    redirect('/account');
  }

  const user = await getUserFromRequest(
    new Request('http://localhost', { headers: { cookie: `pt_session=${sessionToken}` } }),
  );
  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    redirect('/account');
  }

  return (
    <SiteShell>
      <OpsDashboardClient />
    </SiteShell>
  );
}
