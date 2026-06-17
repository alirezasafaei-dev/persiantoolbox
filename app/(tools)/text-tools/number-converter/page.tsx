import NumberConverterPage from '@/components/features/text-tools/NumberConverter';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'تبدیل اعداد فارسی و انگلیسی - جعبه ابزار فارسی',
  description:
    'تبدیل آنی اعداد فارسی (۰۱۲۳۴۵۶۷۸۹) به انگلیسی (0123456789) و بالعکس. پردازش کاملاً محلی.',
  path: '/text-tools/number-converter',
  keywords: ['تبدیل اعداد', 'اعداد فارسی', 'اعداد انگلیسی', 'persian numbers', 'number converter'],
});

export default function NumberConverterRoute() {
  return <NumberConverterPage />;
}
