import AdsTransparencyPage from '@/components/features/monetization/AdsTransparencyPage';
import Container from '@/components/ui/Container';
import Footer from '@/components/ui/Footer';
import Navigation from '@/components/ui/Navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'شفافیت تبلیغات - جعبه ابزار فارسی',
  description: 'اطلاعات شفاف درباره تبلیغات و تنظیمات رضایت کاربران.',
  path: '/ads',
});

export default function AdsTransparencyRoute() {
  return (
    <div className="min-h-dvh flex flex-col page-shell">
      <Navigation />
      <main className="flex-1">
        <Container className="py-10">
          <AdsTransparencyPage />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
