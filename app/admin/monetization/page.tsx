import MonetizationAdminPage from '@/components/features/monetization/MonetizationAdminPage';
import Container from '@/components/ui/Container';
import Footer from '@/components/ui/Footer';
import Navigation from '@/components/ui/Navigation';
import { buildMetadata } from '@/lib/seo';

export const metadata = {
  ...buildMetadata({
    title: 'پنل درآمدزایی - جعبه ابزار فارسی',
    description: 'مدیریت اسلات‌ها و کمپین‌های تبلیغاتی (نسخه MVP).',
    path: '/admin/monetization',
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function MonetizationAdminRoute() {
  return (
    <div className="min-h-dvh flex flex-col page-shell">
      <Navigation />
      <main className="flex-1">
        <Container className="py-10">
          <MonetizationAdminPage />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
