import TaxCalculatorPage from '@/components/features/finance/TaxCalculator';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'محاسبه‌گر مالیات بر درآمد ۱۴۰۵ - جعبه ابزار فارسی',
  description:
    'محاسبه دقیق مالیات بر درآمد حقوق سال ۱۴۰۵ با معافیت ۴۰۰ میلیون تومان و جدول پلکانی. پردازش محلی.',
  path: '/tools/tax-calculator',
  keywords: ['محاسبه مالیات', 'مالیات حقوق', 'tax calculator', 'مالیات ۱۴۰۵', 'معافیت مالیاتی'],
});

export default function TaxCalculatorRoute() {
  return <TaxCalculatorPage />;
}
