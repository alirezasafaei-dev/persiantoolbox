import FeatureDisabledPage from '@/components/features/availability/FeatureDisabledPage';
import AccountPage from '@/components/features/monetization/AccountPage';
import { featurePageMetadata, isFeatureEnabled } from '@/lib/features/availability';

export const metadata = featurePageMetadata('account', {
  title: 'حساب کاربری - PersianToolbox',
});

export default function AccountRoute() {
  if (!isFeatureEnabled('account')) {
    return <FeatureDisabledPage feature="account" />;
  }

  return <AccountPage />;
}
