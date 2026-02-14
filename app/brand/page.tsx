import Container from '@/components/ui/Container';
import Footer from '@/components/ui/Footer';
import Navigation from '@/components/ui/Navigation';
import { buildMetadata } from '@/lib/seo';
import { BRAND } from '@/lib/brand';

export const metadata = buildMetadata({
  title: `برند ${BRAND.masterBrand} | ${BRAND.siteName}`,
  description:
    'معرفی برند ASDEV، اصول مهندسی محصول، و مسیر حرفه‌ای پشت PersianToolbox برای تحویل سیستم‌های پایدار production-grade.',
  path: '/brand',
});

export default function BrandRoute() {
  return (
    <div className="min-h-dvh flex flex-col page-shell">
      <Navigation />
      <main className="flex-1">
        <Container className="py-10 space-y-8">
          <header className="space-y-3">
            <h1 className="text-3xl font-black text-[var(--text-primary)]">
              برند {BRAND.masterBrand}
            </h1>
            <p className="text-[var(--text-secondary)] leading-7">
              PersianToolbox یکی از محصولات برند {BRAND.masterBrand} است که توسط {BRAND.ownerName}{' '}
              توسعه داده می‌شود. تمرکز اصلی این برند، ساخت سیستم‌های وب production-grade با حداکثر
              پایداری عملیاتی، امنیت و استانداردسازی فرآیند انتشار است.
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">اصول اجرایی برند</h2>
            <ul className="list-disc space-y-2 pr-5 text-[var(--text-secondary)]">
              <li>حذف ریسک‌های بحرانی قبل از توسعه قابلیت‌های جدید</li>
              <li>منبع حقیقت واحد برای وضعیت انتشار و تصمیم‌های go/no-go</li>
              <li>قراردادهای CI برای SEO، امنیت و کیفیت</li>
              <li>مستندسازی قابل ممیزی در پایان هر فاز اجرایی</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">ارتباط حرفه‌ای</h2>
            <p className="text-[var(--text-secondary)] leading-7">
              برای همکاری‌های معماری، سخت‌سازی CI/CD و طراحی مسیر مهاجرت زیرساخت، از سایت رسمی شخصی
              اقدام کنید.
            </p>
            <a
              href={BRAND.ownerSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              ورود به سایت رسمی {BRAND.ownerName}
            </a>
          </section>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
