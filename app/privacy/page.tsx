import PrivacyPolicyPage from '@/components/features/monetization/PrivacyPolicyPage';
import Container from '@/components/ui/Container';
import Footer from '@/components/ui/Footer';
import Navigation from '@/components/ui/Navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'سیاست حریم خصوصی - جعبه ابزار فارسی',
  description: 'شفافیت کامل درباره داده‌ها، تاریخچه و حریم خصوصی کاربران Persian Tools.',
  path: '/privacy',
});

export default function PrivacyRoute() {
  return (
    <div className="min-h-dvh flex flex-col page-shell">
      <Navigation />
      <main className="flex-1">
        <Container className="py-10">
          <PrivacyPolicyPage />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
