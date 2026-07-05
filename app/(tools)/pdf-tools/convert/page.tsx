import { redirect } from 'next/navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'تبدیل PDF - ابزار آنلاین رایگان',
  description: 'تبدیل PDF به متن، تصویر و Word. پردازش کاملاً محلی در مرورگر شما.',
  path: '/pdf-tools/convert',
});

export default function ConvertPdfCategoryPage() {
  redirect('/pdf-tools/convert/pdf-to-text');
}
