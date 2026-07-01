/* Licensing note: repository is MIT through v1.1.x; planned dual-license policy starts from v2.0.0 (docs/licensing/dual-license-policy.md). */
import HomePage from '@/components/HomePage';
import SiteShell from '@/components/ui/SiteShell';
import { getHomeMetaDescription, getHomeMetaTitle } from '@/lib/home-copy';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: getHomeMetaTitle(),
  description: getHomeMetaDescription(),
  path: '/',
  keywords: [
    'ابزار آنلاین فارسی',
    'محاسبه وام',
    'محاسبه حقوق',
    'تبدیل تاریخ شمسی',
    'فشرده سازی PDF',
    'OCR فارسی',
    'فاکتور آنلاین',
    'رزومه ساز فارسی',
    'ابزار رایگان',
  ],
});

export default function RootPage() {
  return (
    <SiteShell containerClassName="py-10">
      <HomePage />
    </SiteShell>
  );
}
