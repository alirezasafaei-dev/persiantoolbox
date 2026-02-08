import Container from '@/components/ui/Container';
import Footer from '@/components/ui/Footer';
import Navigation from '@/components/ui/Navigation';
import SiteSettingsAdminPage from '@/components/features/monetization/SiteSettingsAdminPage';
import { getUserFromSessionToken } from '@/lib/server/auth';
import { isAdminUser } from '@/lib/server/adminAuth';
import { buildMetadata } from '@/lib/seo';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export const metadata = {
  ...buildMetadata({
    title: 'تنظیمات سایت - پنل ادمین',
    description: 'مدیریت لینک ثبت سفارش و نمونه‌کارها برای نمایش در فوتر سایت.',
    path: '/admin/site-settings',
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminSiteSettingsRoute() {
  const cookieStore = await cookies();
  const token = cookieStore.get('pt_session')?.value ?? null;
  const user = await getUserFromSessionToken(token);
  if (!isAdminUser(user)) {
    notFound();
  }

  return (
    <div className="min-h-dvh flex flex-col page-shell">
      <Navigation />
      <main className="flex-1">
        <Container className="py-10">
          <SiteSettingsAdminPage />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
