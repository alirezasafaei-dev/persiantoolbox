import SubscriptionPlansPage from '@/components/features/monetization/SubscriptionPlansPage';
import Container from '@/components/ui/Container';
import Footer from '@/components/ui/Footer';
import Navigation from '@/components/ui/Navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'پلن‌های اشتراک - جعبه ابزار فارسی',
  description: 'پلن‌های اشتراک تاریخچه کارها و قیمت‌گذاری اولیه Persian Tools.',
  path: '/plans',
});

export default function PlansRoute() {
  return (
    <div className="min-h-dvh flex flex-col page-shell">
      <Navigation />
      <main className="flex-1">
        <Container className="py-10">
          <SubscriptionPlansPage />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
