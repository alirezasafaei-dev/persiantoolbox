/* Licensing note: repository is MIT through v1.1.x; planned dual-license policy starts from v2.0.0 (docs/licensing/dual-license-policy.md). */
import HomePage from '@/components/HomePage';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import { getToolCountForDisplay } from '@/lib/tools-registry';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

export const revalidate = 3600;

const toolCount = getToolCountForDisplay();

export const metadata = buildMetadata({
  title: `جعبه ابزار فارسی — بیش از ${toPersianNumbers(toolCount)} ابزار آنلاین رایگان`,
  // eslint-disable-next-line max-len
  description: `مجموعه کامل ابزارهای آنلاین فارسی: محاسبه وام و حقوق، تبدیل تاریخ شمسی، فشرده‌سازی PDF، OCR فارسی، فاکتورساز، رزومه‌ساز و بیش از ${toPersianNumbers(toolCount)} ابزار. پردازش ۱۰۰٪ محلی در مرورگر — بدون ثبت‌نام.`,
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
