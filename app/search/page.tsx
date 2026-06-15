import { buildMetadata } from '@/lib/seo';
import SearchContent from './SearchContent';

export const metadata = buildMetadata({
  title: 'جستجوی ابزارها - جعبه ابزار فارسی',
  description: 'جستجوی سریع در تمام ابزارهای PDF، مالی، تصویر، متنی و تاریخ - جعبه ابزار فارسی',
  path: '/search',
});

export default function SearchPage() {
  return <SearchContent />;
}
