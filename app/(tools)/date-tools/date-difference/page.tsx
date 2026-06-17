import DateDifferencePage from '@/components/features/date-tools/DateDifference';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'محاسبه差异 تاریخ - جعبه ابزار فارسی',
  description: 'محاسبه آنی تعداد روز، هفته، ماه و سال بین دو تاریخ میلادی. پردازش محلی.',
  path: '/date-tools/date-difference',
  keywords: ['محاسبه差异 تاریخ', 'difference between dates', 'روز شمار', 'محاسبه روز'],
});

export default function DateDifferenceRoute() {
  return <DateDifferencePage />;
}
