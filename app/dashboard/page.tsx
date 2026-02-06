import UsageDashboardPage from '@/components/features/usage-dashboard/UsageDashboardPage';
import { buildMetadata } from '@/lib/seo';

export const metadata = {
  ...buildMetadata({
    title: 'داشبورد استفاده - جعبه ابزار فارسی',
    description: 'گزارش استفاده و مسیرهای پربازدید (ذخیره محلی)',
    path: '/dashboard',
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function UsageDashboardRoute() {
  return <UsageDashboardPage />;
}
