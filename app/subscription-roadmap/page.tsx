import SubscriptionPublicRoadmapPage from '@/components/features/monetization/SubscriptionPublicRoadmapPage';
import Container from '@/components/ui/Container';
import Footer from '@/components/ui/Footer';
import Navigation from '@/components/ui/Navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'نقشه‌راه اشتراک - جعبه ابزار فارسی',
  description: 'نقشه‌راه عمومی قابلیت‌های اشتراکی Persian Tools برای کاربران.',
  path: '/subscription-roadmap',
});

export default function SubscriptionRoadmapRoute() {
  return (
    <div className="min-h-dvh flex flex-col page-shell">
      <Navigation />
      <main className="flex-1">
        <Container className="py-10">
          <SubscriptionPublicRoadmapPage />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
