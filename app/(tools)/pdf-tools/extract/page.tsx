import { redirect } from 'next/navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'استخراج از PDF - ابزار آنلاین رایگان',
  description: 'استخراج متن و صفحات از PDF. پردازش کاملاً محلی در مرورگر شما.',
  path: '/pdf-tools/extract',
});

export default function ExtractPdfCategoryPage() {
  redirect('/pdf-tools/extract/extract-text');
}
