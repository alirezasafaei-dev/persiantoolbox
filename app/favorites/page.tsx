import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import FavoritesContent from './FavoritesContent';

export const metadata = buildMetadata({
  title: 'ابزارهای مورد علاقه - جعبه ابزار فارسی',
  description: 'ابزارهای مورد علاقه خود در جعبه ابزار فارسی را مشاهده و مدیریت کنید.',
  path: '/favorites',
  robots: { index: false, follow: true },
});

export default function FavoritesPage() {
  return (
    <SiteShell containerClassName="py-10">
      <FavoritesContent />
    </SiteShell>
  );
}
