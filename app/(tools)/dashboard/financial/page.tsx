import { redirect } from 'next/navigation';
import { getUserFromRequest } from '@/lib/server/auth';
import { cookies } from 'next/headers';
import FinancialDashboard from '@/components/features/finance/FinancialDashboard';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'داشبورد مالی - جعبه ابزار فارسی',
  description:
    'سناریوهای مالی ذخیره‌شده، مقایسه آنها و مدیریت اطلاعات مالی شخصی در داشبورد مالی جعبه ابزار فارسی.',
  path: '/dashboard/financial',
  keywords: ['داشبورد مالی', 'سناریوی مالی', 'مقایسه مالی', 'مدیریت مالی'],
  robots: { index: false, follow: false },
});

export default async function FinancialDashboardPage() {
  const cookieStore = await cookies();
  const request = new Request('http://localhost', {
    headers: { cookie: cookieStore.toString() },
  });
  const user = await getUserFromRequest(request);
  if (!user) {
    redirect('/account');
  }

  return (
    <SiteShell>
      <div className="container mx-auto px-4 py-8">
        <FinancialDashboard />
      </div>
    </SiteShell>
  );
}
