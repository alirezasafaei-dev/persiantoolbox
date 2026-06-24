/* Licensing note: repository is MIT through v1.1.x; planned dual-license policy starts from v2.0.0 (docs/licensing/dual-license-policy.md). */
import HomePage from '@/components/HomePage';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'جعبه ابزار فارسی - صفحه اصلی',
  description:
    'مجموعه کامل و رایگان ابزارهای آنلاین فارسی: محاسبه وام، حقوق، سود بانکی، تبدیل PDF، فشرده‌سازی تصویر، OCR فارسی و بیش از ۵۵ ابزار کاربردی. پردازش محلی در مرورگر.',
  path: '/',
});

export default function RootPage() {
  return (
    <SiteShell containerClassName="py-10">
      <HomePage />
    </SiteShell>
  );
}
