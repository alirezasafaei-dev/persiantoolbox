import { buildMetadata } from '@/lib/seo';
import HistoryContent from './HistoryContent';

export const metadata = buildMetadata({
  title: 'تاریخچه عملیات - جعبه ابزار فارسی',
  description: 'تاریخچه عملیات انجام شده در ابزارهای جعبه ابزار فارسی را مشاهده کنید.',
  path: '/history',
  robots: { index: false, follow: true },
});

export default function HistoryPage() {
  return <HistoryContent />;
}
