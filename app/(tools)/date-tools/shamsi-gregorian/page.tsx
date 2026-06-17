import DateConverterPage from '@/components/features/date-tools/DateConverter';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'تبدیل تاریخ شمسی و میلادی - جعبه ابزار فارسی',
  description:
    'تبدیل آنی تاریخ شمسی (هجری خورشیدی) به میلادی (گریگورین) و بالعکس. محاسبه دقیق بدون ارسال داده.',
  path: '/date-tools/shamsi-gregorian',
  keywords: [
    'تبدیل تاریخ',
    'تاریخ شمسی',
    'تاریخ میلادی',
    'shamsi',
    'gregorian',
    'persian calendar',
  ],
});

export default function DateConverterRoute() {
  return <DateConverterPage />;
}
