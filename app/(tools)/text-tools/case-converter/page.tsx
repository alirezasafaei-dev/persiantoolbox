import CaseConverterPage from '@/components/features/text-tools/CaseConverter';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'تبدیل حروف - جعبه ابزار فارسی',
  description: 'تبدیل متن به حروف بزرگ، کوچک، عنوانی یا جمله‌ای. پردازش آنی و محلی.',
  path: '/text-tools/case-converter',
  keywords: ['تبدیل case', 'uppercase', 'lowercase', 'title case', 'تبدیل حروف'],
});

export default function CaseConverterRoute() {
  return <CaseConverterPage />;
}
