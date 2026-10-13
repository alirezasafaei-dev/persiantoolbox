import type { Metadata } from 'next';
import AIImageGenerator from '@/components/features/image-tools/AIImageGenerator';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'تصویرساز هوشمند فارسی | پرشین تولباکس',
  description: 'ساخت تصویر از توضیح فارسی یا انگلیسی.',
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10" dir="rtl">
      <h1 className="mb-4 text-3xl font-bold">تصویرساز هوشمند</h1>
      <p className="mb-8">ایدهٔ خود را بنویسید؛ تصویر را همین‌جا ببینید و دانلود کنید.</p>
      {process.env['IMAGE_GENERATION_ENABLED'] === 'true' ? (
        <AIImageGenerator />
      ) : (
        <p>تصویرساز در حال آماده‌سازی است.</p>
      )}
    </section>
  );
}
