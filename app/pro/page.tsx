import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { ASDEV_SUPPORT_CHAT_URL } from '@/lib/asdev-network';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'نسخه سازمانی - جعبه ابزار فارسی',
  description: 'معرفی مسیر Pro برای سازمان‌ها، با دسترسی حرفه‌ای و نیازمندی‌های اتصال آنلاین.',
  path: '/pro',
});

export default function ProPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl section-surface p-8 text-center space-y-4">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">
          نسخه سازمانی جعبه ابزار فارسی
        </h1>
        <p className="text-[var(--text-secondary)] leading-7">
          این مسیر برای قابلیت‌های Pro و دسترسی سازمانی آماده‌سازی شده است.
        </p>
        <p className="text-sm text-[var(--color-warning)]">
          برای استفاده از امکانات Pro اتصال اینترنت الزامی است.
        </p>
        <div className="pt-2">
          <Link
            href={ASDEV_SUPPORT_CHAT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-md"
          >
            درخواست دسترسی سازمانی
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
