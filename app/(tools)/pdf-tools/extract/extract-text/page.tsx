import { buildMetadata } from '@/lib/seo';

export const metadata = {
  ...buildMetadata({
    title: 'استخراج متن PDF - جعبه ابزار فارسی',
    description: 'استخراج متن کامل از فایل‌های PDF',
    path: '/pdf-tools/extract/extract-text',
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function ExtractTextRoute() {
  return (
    <div className="max-w-3xl mx-auto section-surface p-8 text-center">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">استخراج متن PDF</h1>
      <p className="mt-3 text-[var(--text-muted)]">
        این ابزار در حال توسعه است و به‌زودی فعال می‌شود.
      </p>
    </div>
  );
}
