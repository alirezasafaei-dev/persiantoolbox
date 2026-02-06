import AccountPage from '@/components/features/monetization/AccountPage';
import Container from '@/components/ui/Container';
import Footer from '@/components/ui/Footer';
import Navigation from '@/components/ui/Navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = {
  ...buildMetadata({
    title: 'حساب کاربری - جعبه ابزار فارسی',
    description: 'مدیریت اشتراک تاریخچه و تاریخچه کارها.',
    path: '/account',
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountRoute() {
  return (
    <div className="min-h-dvh flex flex-col page-shell">
      <Navigation />
      <main className="flex-1">
        <Container className="py-10">
          <AccountPage />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
