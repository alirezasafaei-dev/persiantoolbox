import SupportPage from '@/components/features/monetization/SupportPage';
import Container from '@/components/ui/Container';
import Footer from '@/components/ui/Footer';
import Navigation from '@/components/ui/Navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'حمایت مالی - جعبه ابزار فارسی',
  description: 'حمایت از Persian Tools برای توسعه ابزارهای خصوصی و پردازش محلی.',
  path: '/support',
});

export default function SupportRoute() {
  return (
    <div className="min-h-dvh flex flex-col page-shell">
      <Navigation />
      <main className="flex-1">
        <Container className="py-10">
          <SupportPage />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
