import { redirect } from 'next/navigation';
import { getUserFromRequest } from '@/lib/server/auth';
import { cookies } from 'next/headers';
import FinancialDashboard from '@/components/features/finance/FinancialDashboard';
import SiteShell from '@/components/ui/SiteShell';

export const metadata = {
  title: 'داشبورد مالی - جعبه ابزار فارسی',
  description: 'سناریوهای مالی ذخیره‌شده و مقایسه آنها',
};

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
