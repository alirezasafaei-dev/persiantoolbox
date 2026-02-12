import Container from '@/components/ui/Container';
import Footer from '@/components/ui/Footer';
import Navigation from '@/components/ui/Navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'نحوه کار PersianToolbox - جعبه ابزار فارسی',
  description: 'توضیح نحوه کار ابزارها، پردازش محلی و شیوه استفاده از خروجی‌ها',
  path: '/how-it-works',
});

export default function HowItWorksRoute() {
  return (
    <div className="min-h-dvh flex flex-col page-shell">
      <Navigation />
      <main className="flex-1">
        <Container className="py-10 space-y-8">
          <header className="space-y-3">
            <h1 className="text-3xl font-black text-[var(--text-primary)]">نحوه کار ابزارها</h1>
            <p className="text-[var(--text-secondary)] leading-7">
              در PersianToolbox ابتدا ورودی را در مرورگر وارد می‌کنید، سپس محاسبه یا پردازش محلی
              انجام می‌شود و خروجی همان لحظه در اختیار شما قرار می‌گیرد.
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">فرآیند سه مرحله‌ای</h2>
            <ol className="list-decimal space-y-2 pr-5 text-[var(--text-secondary)]">
              <li>ورودی را با واحد و فرمت درست وارد کنید.</li>
              <li>ابزار نتیجه را به‌صورت محلی و سریع محاسبه می‌کند.</li>
              <li>خروجی را بررسی، کپی یا در مرورگر ذخیره کنید.</li>
            </ol>
          </section>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
