import RemoveSpacesPage from '@/components/features/text-tools/RemoveSpaces';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'حذف فاصله‌های اضافی - جعبه ابزار فارسی',
  description: 'حذف آنی فاصله‌های اضافی، Tab و فاصله‌های انتهایی از متن. پردازش کاملاً محلی.',
  path: '/text-tools/remove-spaces',
  keywords: ['حذف فاصله', 'remove spaces', 'trim text', 'پاکسازی متن'],
});

export default function RemoveSpacesRoute() {
  return <RemoveSpacesPage />;
}
