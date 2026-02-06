import { buildMetadata } from '@/lib/seo';

export const metadata = {
  ...buildMetadata({
    title: 'استخراج متن از PDF - جعبه ابزار فارسی',
    description: 'استخراج متن از فایل‌های PDF برای استفاده و ویرایش',
    path: '/pdf-tools/convert/pdf-to-text',
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function PdfToTextRoute() {
  return (
    <div className="max-w-3xl mx-auto section-surface p-8 text-center">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">استخراج متن از PDF</h1>
      <p className="mt-3 text-[var(--text-muted)]">
        این ابزار در حال توسعه است و به‌زودی فعال می‌شود.
      </p>
    </div>
  );
}
