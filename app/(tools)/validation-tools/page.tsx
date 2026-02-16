import { redirect } from 'next/navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'انتقال به ابزارها - جعبه ابزار فارسی',
  description: 'این صفحه از دسترس خارج شده و به صفحه ابزارها منتقل شده است.',
  path: '/validation-tools',
});

export default function ValidationToolsRoute() {
  redirect('/tools');
}
