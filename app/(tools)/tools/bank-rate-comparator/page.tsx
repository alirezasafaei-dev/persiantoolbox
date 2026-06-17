import BankRateComparatorPage from '@/components/features/finance/BankRateComparator';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'مقایسه نرخ سود بانک‌ها - جعبه ابزار فارسی',
  description: 'مقایسه نرخ سود سپرده بانک‌های دولتی و خصوصی. محاسبه سود ماهانه و سالانه.',
  path: '/tools/bank-rate-comparator',
  keywords: ['نرخ سود بانک', 'سود سپرده', 'bank interest rate', 'مقایسه بانک'],
});

export default function BankRateComparatorRoute() {
  return <BankRateComparatorPage />;
}
