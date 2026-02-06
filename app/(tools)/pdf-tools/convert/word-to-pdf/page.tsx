import { buildMetadata } from '@/lib/seo';

export const metadata = {
  ...buildMetadata({
    title: 'تبدیل Word به PDF - جعبه ابزار فارسی',
    description: 'تبدیل فایل‌های Word به PDF به صورت آنلاین',
    path: '/pdf-tools/convert/word-to-pdf',
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function WordToPdfRoute() {
  return (
    <div className="max-w-3xl mx-auto section-surface p-8 text-center">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">تبدیل Word به PDF</h1>
      <p className="mt-3 text-[var(--text-muted)]">
        این ابزار در حال توسعه است و به‌زودی فعال می‌شود.
      </p>
    </div>
  );
}
