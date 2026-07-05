import { redirect } from 'next/navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'امنیت PDF - ابزار آنلاین رایگان',
  description: 'رمزگذاری و رمزگشایی PDF. پردازش کاملاً محلی در مرورگر شما.',
  path: '/pdf-tools/security',
});

export default function SecurityPdfCategoryPage() {
  redirect('/pdf-tools/security/encrypt-pdf');
}
