import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import AccountPage from '@/components/features/monetization/AccountPage';
import SiteShell from '@/components/ui/SiteShell';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';

export const metadata = featurePageMetadata('account', {
  title: 'حساب کاربری - جعبه ابزار فارسی',
});

export default function AccountRoute() {
  if (!isFeatureEnabled('account')) {
    return (
      <SiteShell>
        <FeatureDisabledPage feature="account" />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <AccountPage />
    </SiteShell>
  );
}
