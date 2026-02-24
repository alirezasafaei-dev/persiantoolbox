import { permanentRedirect } from 'next/navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'برند ASDEV - جعبه ابزار فارسی',
  description: 'این مسیر به صفحه برند ASDEV هدایت می‌شود.',
  path: '/brand',
});

export default function BrandRoute() {
  permanentRedirect('/asdev');
}
