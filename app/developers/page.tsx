import DevelopersPage from '@/components/features/developers/DevelopersPage';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'مرکز توسعه‌دهندگان - جعبه ابزار فارسی',
  description: 'راهنمای استفاده از کتابخانه persian-tools برای توسعه‌دهندگان.',
  path: '/developers',
});

export default function DevelopersRoute() {
  return <DevelopersPage />;
}
