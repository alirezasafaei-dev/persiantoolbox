import { redirect } from 'next/navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'فشرده‌سازی PDF - ابزار آنلاین رایگان',
  description: 'فشرده‌سازی PDF با حفظ کیفیت. پردازش کاملاً محلی در مرورگر شما.',
  path: '/pdf-tools/compress',
});

export default function CompressPdfCategoryPage() {
  redirect('/pdf-tools/compress/compress-pdf');
}
