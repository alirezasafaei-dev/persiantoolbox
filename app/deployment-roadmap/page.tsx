import { buildMetadata } from '@/lib/seo';

export const metadata = {
  ...buildMetadata({
    title: 'نقشه استقرار - جعبه ابزار فارسی',
    description: 'چک‌لیست گرافیکی آماده‌سازی استقرار Persian Tools.',
    path: '/deployment-roadmap',
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function DeploymentRoadmapPage() {
  return (
    <div className="min-h-dvh px-4 py-6">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">نقشه استقرار</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              مراحل آماده‌سازی دیپلوی و استقرار به‌صورت چک‌لیست گرافیکی.
            </p>
          </div>
          <a
            className="inline-flex items-center gap-2 rounded-md border border-[var(--border-default)] px-3 py-2 text-sm text-[var(--text-primary)] hover:border-[var(--border-strong)]"
            href="/deployment-roadmap.html"
            target="_blank"
            rel="noreferrer"
          >
            باز کردن در تب جدید
          </a>
        </div>
        <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-white">
          <iframe
            title="Deployment Roadmap"
            src="/deployment-roadmap.html"
            className="h-[75vh] w-full"
          />
        </div>
      </div>
    </div>
  );
}
