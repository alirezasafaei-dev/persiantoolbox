import Link from 'next/link';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';
import Container from '@/components/ui/Container';
import PopularTools from '@/components/home/PopularTools';

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col page-shell">
      <Navigation />
      <main className="flex-1">
        <Container className="py-16 space-y-12">
          <section className="section-surface p-10 text-center">
            <div className="text-6xl font-black text-[var(--text-primary)]">۴۰۴</div>
            <h1 className="mt-4 text-2xl font-black text-[var(--text-primary)]">
              صفحه‌ای که دنبالش بودید پیدا نشد
            </h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              شاید لینک اشتباه باشد یا صفحه جابه‌جا شده باشد. از جست‌وجوی ابزارها استفاده کنید.
            </p>
            <form action="/tools" method="get" className="mt-6 flex flex-wrap justify-center gap-3">
              <input
                name="query"
                type="search"
                placeholder="جستجوی ابزار..."
                className="input-field w-full max-w-sm"
              />
              <button type="submit" className="btn btn-primary btn-md">
                جستجو
              </button>
            </form>
            <div className="mt-4">
              <Link href="/" className="text-sm font-semibold text-[var(--color-primary)]">
                بازگشت به صفحه اصلی
              </Link>
            </div>
          </section>

          <PopularTools />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
