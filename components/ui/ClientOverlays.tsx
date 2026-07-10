'use client';

import dynamic from 'next/dynamic';
import ScrollToTop from '@/components/ui/ScrollToTop';

const SmartCTA = dynamic(() => import('@/components/ui/SmartCTA').then((m) => m.SmartCTA), {
  ssr: false,
});
const ExitIntentPopup = dynamic(
  () => import('@/components/ui/SmartCTA').then((m) => m.ExitIntentPopup),
  { ssr: false },
);
const ConsentBanner = dynamic(() => import('@/components/ui/ConsentBanner'), { ssr: false });
const QuickToolsFAB = dynamic(() => import('@/components/ui/QuickToolsFAB'), { ssr: false });

export default function ClientOverlays() {
  return (
    <>
      <SmartCTA />
      <ExitIntentPopup />
      <ScrollToTop />
      <QuickToolsFAB />
      <ConsentBanner />
    </>
  );
}
