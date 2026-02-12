import Container from '@/components/ui/Container';
import Footer from '@/components/ui/Footer';
import Navigation from '@/components/ui/Navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'درباره PersianToolbox - جعبه ابزار فارسی',
  description: 'درباره ماموریت، معماری local-first و استانداردهای PersianToolbox',
  path: '/about',
});

export default function AboutRoute() {
  return (
    <div className="min-h-dvh flex flex-col page-shell">
      <Navigation />
      <main className="flex-1">
        <Container className="py-10 space-y-8">
          <header className="space-y-3">
            <h1 className="text-3xl font-black text-[var(--text-primary)]">درباره ما</h1>
            <p className="text-[var(--text-secondary)] leading-7">
              PersianToolbox یک مجموعه ابزار آنلاین فارسی با رویکرد local-first است. هدف ما ارائه
              ابزارهای سریع، شفاف و قابل اتکا برای نیازهای روزمره کاربران فارسی‌زبان است.
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">اصول محصول</h2>
            <ul className="list-disc space-y-2 pr-5 text-[var(--text-secondary)]">
              <li>محاسبات و پردازش‌ها تا حد امکان در مرورگر کاربر انجام می‌شود.</li>
              <li>وابستگی runtime به سرویس‌های خارجی به صفر نزدیک نگه داشته می‌شود.</li>
              <li>رابط کاربری ساده، سریع و قابل استفاده روی موبایل و دسکتاپ طراحی می‌شود.</li>
            </ul>
          </section>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
