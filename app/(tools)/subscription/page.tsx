import { buildMetadata } from '@/lib/seo';
import SubscriptionContent from './SubscriptionContent';

export const metadata = buildMetadata({
  title: 'مدیریت اشتراک - جعبه ابزار فارسی',
  description: 'اشتراک جعبه ابزار فارسی را مدیریت کنید. طرح‌ها و وضعیت اشتراک خود را مشاهده کنید.',
  path: '/subscription',
});

export default function SubscriptionPage() {
  return <SubscriptionContent />;
}
