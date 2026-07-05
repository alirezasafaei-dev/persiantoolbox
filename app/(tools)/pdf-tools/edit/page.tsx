import { redirect } from 'next/navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'ویرایش PDF - ابزار آنلاین رایگان',
  description: 'ویرایش PDF: اضافه کردن شماره صفحه، حذف و بازآرایی صفحات.',
  path: '/pdf-tools/edit',
});

export default function EditPdfCategoryPage() {
  redirect('/pdf-tools/edit/add-page-numbers');
}
