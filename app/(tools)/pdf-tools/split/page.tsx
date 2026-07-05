import { redirect } from 'next/navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'تقسیم PDF - ابزار آنلاین رایگان',
  description: 'تقسیم PDF به فایل‌های جداگانه. پردازش کاملاً محلی در مرورگر شما.',
  path: '/pdf-tools/split',
});

export default function SplitPdfCategoryPage() {
  redirect('/pdf-tools/split/split-pdf');
}
