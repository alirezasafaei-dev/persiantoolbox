'use client';

import dynamic from 'next/dynamic';
import { isGa4Enabled } from '@/lib/analytics/ga4Config';

const GoogleAnalytics = dynamic(() => import('@/components/analytics/GoogleAnalytics'), {
  ssr: false,
});

const ServiceWorkerRegistration = dynamic(
  () => import('@/components/ui/ServiceWorkerRegistration'),
  {
    ssr: false,
  },
);
const UsageTracker = dynamic(() => import('@/components/ui/UsageTracker'), { ssr: false });
const PlausibleAnalytics = dynamic(() => import('@/components/analytics/PlausibleAnalytics'), {
  ssr: false,
});
const SocialLandingTracker = dynamic(() => import('@/components/analytics/SocialLandingTracker'), {
  ssr: false,
});

export default function ClientRuntimeBoot({ nonce }: { nonce?: string | undefined }) {
  return (
    <>
      <ServiceWorkerRegistration />
      <UsageTracker />
      {isGa4Enabled() ? <GoogleAnalytics nonce={nonce} /> : <PlausibleAnalytics />}
      <SocialLandingTracker />
    </>
  );
}
