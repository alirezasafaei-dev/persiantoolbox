import MonetizationAdminPage from '@/components/features/monetization/MonetizationAdminPage';
import Container from '@/components/ui/Container';
import Footer from '@/components/ui/Footer';
import Navigation from '@/components/ui/Navigation';
import { getAnalyticsSummary } from '@/lib/analyticsStore';
import { getUserFromSessionToken } from '@/lib/server/auth';
import { isAdminUser } from '@/lib/server/adminAuth';
import { buildMetadata } from '@/lib/seo';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

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

export default async function MonetizationAdminRoute() {
  const cookieStore = await cookies();
  const token = cookieStore.get('pt_session')?.value ?? null;
  const user = await getUserFromSessionToken(token);
  if (!isAdminUser(user)) {
    notFound();
  }

  const summary = await getAnalyticsSummary();

  return (
    <div className="min-h-dvh flex flex-col page-shell">
      <Navigation />
      <main className="flex-1">
        <Container className="py-10">
          <MonetizationAdminPage initialSummary={summary} />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
