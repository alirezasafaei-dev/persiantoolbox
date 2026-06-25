import { buildMetadata } from '@/lib/seo';
import SearchContent from './SearchContent';
import SiteShell from '@/components/ui/SiteShell';

export const metadata = buildMetadata({
  title: 'جستجوی ابزارها - جعبه ابزار فارسی',
  description: 'جستجوی سریع در تمام ابزارهای PDF، مالی، تصویر، متنی و تاریخ - جعبه ابزار فارسی',
  path: '/search',
  robots: { index: false, follow: true },
});

export default function SearchPage() {
  return (
    <SiteShell containerClassName="py-10">
      <SearchContent />
    </SiteShell>
  );
}
