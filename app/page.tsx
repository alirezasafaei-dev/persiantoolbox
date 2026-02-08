/* Licensing note: repository is MIT through v1.1.x; planned dual-license policy starts from v2.0.0 (docs/licensing/dual-license-policy.md). */
import HomePage from '@/components/HomePage';
import Container from '@/components/ui/Container';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'جعبه ابزار فارسی - صفحه اصلی',
  description: 'ابزارهای PDF، محاسبات مالی و پردازش تصویر - همه در یک مکان، رایگان و آسان',
  path: '/',
});

export default function RootPage() {
  return (
    <div className="min-h-dvh flex flex-col page-shell">
      <Navigation />

      <main className="flex-1">
        <Container className="py-10">
          <HomePage />
        </Container>
      </main>

      <Footer />
    </div>
  );
}
