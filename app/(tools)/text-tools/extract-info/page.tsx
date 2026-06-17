import ExtractInfoPage from '@/components/features/text-tools/ExtractInfo';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'استخراج اطلاعات از متن - جعبه ابزار فارسی',
  description: 'استخراج خودکار ایمیل، شماره تلفن، URL و اعداد از متن. پردازش کاملاً محلی.',
  path: '/text-tools/extract-info',
  keywords: [
    'استخراج ایمیل',
    'استخراج شماره تلفن',
    'extract emails',
    'extract phones',
    'استخراج اطلاعات',
  ],
});

export default function ExtractInfoRoute() {
  return <ExtractInfoPage />;
}
