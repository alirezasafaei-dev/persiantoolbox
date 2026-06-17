import { buildMetadata } from '@/lib/seo';
import PremiumContent from './PremiumContent';

export const metadata = buildMetadata({
  title: 'اشتراک حرفه‌ای - جعبه ابزار فارسی',
  description: 'طرح‌های اشتراک حرفه‌ای جعبه ابزار فارسی. امکانات پیشرفته با پردازش محلی.',
  path: '/premium',
});

export default function PremiumPage() {
  return <PremiumContent />;
}
