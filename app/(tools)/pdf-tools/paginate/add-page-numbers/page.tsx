import { buildMetadata } from '@/lib/seo';

export const metadata = {
  ...buildMetadata({
    title: 'شماره صفحه PDF - جعبه ابزار فارسی',
    description: 'افزودن شماره صفحه به فایل‌های PDF',
    path: '/pdf-tools/paginate/add-page-numbers',
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function AddPageNumbersRoute() {
  return (
    <div className="max-w-3xl mx-auto section-surface p-8 text-center">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">افزودن شماره صفحه به PDF</h1>
      <p className="mt-3 text-[var(--text-muted)]">
        این ابزار در حال توسعه است و به‌زودی فعال می‌شود.
      </p>
    </div>
  );
}
