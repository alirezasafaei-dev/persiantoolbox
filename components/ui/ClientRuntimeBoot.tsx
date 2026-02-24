'use client';

import dynamic from 'next/dynamic';

const ServiceWorkerRegistration = dynamic(
  () => import('@/components/ui/ServiceWorkerRegistration'),
  {
    ssr: false,
  },
);
const UsageTracker = dynamic(() => import('@/components/ui/UsageTracker'), { ssr: false });

export default function ClientRuntimeBoot() {
  return (
    <>
      <ServiceWorkerRegistration />
      <UsageTracker />
    </>
  );
}
