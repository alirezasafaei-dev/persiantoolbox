import LivingCostPage from '@/components/features/finance/LivingCost';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'محاسبه هزینه زندگی - جعبه ابزار فارسی',
  description:
    'تخمین هزینه‌های ماهانه و سالانه زندگی بر اساس دسته‌بندی‌های مختلف. قیمت‌های واقعی ۱۴۰۵.',
  path: '/tools/living-cost',
  keywords: ['هزینه زندگی', 'هزینه ماهانه', 'living cost', 'بودجه‌بندی', 'هزینه ۱۴۰۵'],
});

export default function LivingCostRoute() {
  return <LivingCostPage />;
}
