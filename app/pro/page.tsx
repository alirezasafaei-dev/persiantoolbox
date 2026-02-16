import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'PersianToolbox Pro - دسترسی سازمانی',
  description: 'نسخه Pro برای سرویس‌های آنلاین و دسترسی سازمانی. این بخش نیازمند اتصال اینترنت است.',
  path: '/pro',
});

export default function ProPage() {
  return (
    <div className="max-w-3xl mx-auto section-surface p-8 text-center space-y-4">
      <h1 className="text-3xl font-black text-[var(--text-primary)]">PersianToolbox Pro</h1>
      <p className="text-[var(--text-secondary)] leading-7">
        این مسیر برای قابلیت‌های Pro و دسترسی سازمانی آماده‌سازی شده است.
      </p>
      <p className="text-sm text-[var(--color-warning)]">
        برای استفاده از امکانات Pro اتصال اینترنت الزامی است.
      </p>
      <div className="pt-2">
        <Link href="/support" className="btn btn-primary px-5 py-2 text-sm">
          درخواست دسترسی سازمانی
        </Link>
      </div>
    </div>
  );
}
