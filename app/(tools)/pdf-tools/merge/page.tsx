import { redirect } from 'next/navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'ادغام PDF - انتقال مسیر',
  description: 'این مسیر به نسخه اصلی ابزار ادغام PDF هدایت می‌شود.',
  path: '/pdf-tools/merge',
});

export default function MergePdfRedirectPage() {
  redirect('/pdf-tools/merge/merge-pdf');
}
