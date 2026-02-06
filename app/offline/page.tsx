import { buildMetadata } from '@/lib/seo';
import OfflineActions from '@/components/ui/OfflineActions';

export const metadata = {
  ...buildMetadata({
    title: 'آفلاین - جعبه ابزار فارسی',
    description: 'در حال حاضر آفلاین هستید. لطفاً اتصال اینترنت را بررسی کنید.',
    path: '/offline',
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">در حال حاضر آفلاین هستید</h1>
        <p className="text-[var(--text-secondary)]">
          به نظر می‌رسد اتصال اینترنت برقرار نیست. پس از اتصال مجدد، صفحه را تازه کنید.
        </p>
        <OfflineActions />
      </div>
    </div>
  );
}
