import { redirect } from 'next/navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'واترمارک PDF - ابزار آنلاین رایگان',
  description: 'افزودن واترمارک به PDF. پردازش کاملاً محلی در مرورگر شما.',
  path: '/pdf-tools/watermark',
});

export default function WatermarkPdfCategoryPage() {
  redirect('/pdf-tools/watermark/add-watermark');
}
