'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import { recordAdConsentAction } from '@/shared/analytics/ads';
import { getAdsConsent, type AdsConsentState, updateAdsConsent } from '@/shared/consent/adsConsent';

export default function AdsConsentBanner() {
  const [consent, setConsent] = useState<AdsConsentState | null>(null);

  useEffect(() => {
    setConsent(getAdsConsent());
  }, []);

  const hasAnswered = consent?.updatedAt !== null;
  if (!consent || hasAnswered) {
    return null;
  }

  if (consent.contextualAds) {
    return null;
  }

  const handleAccept = () => {
    const next = updateAdsConsent({ contextualAds: true, targetedAds: false });
    setConsent(next);
    recordAdConsentAction('accept', 'banner');
  };

  const handleDecline = () => {
    const next = updateAdsConsent({ contextualAds: false, targetedAds: false });
    setConsent(next);
    recordAdConsentAction('decline', 'banner');
  };

  return (
    <div className="pointer-events-auto fixed inset-x-4 bottom-4 z-[60] rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/95 p-4 shadow-[var(--shadow-strong)] backdrop-blur-lg transition">
      <div className="flex flex-col gap-1 text-sm leading-6 text-[var(--text-primary)]">
        <p className="text-base font-semibold">رضایت نمایش تبلیغات</p>
        <p className="text-[var(--text-muted)]">
          برای تامین هزینه‌های نگهداری، تبلیغات محلی فقط پس از رضایت شما نمایش داده می‌شود.
        </p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" variant="primary" onClick={handleAccept}>
          موافقت با تبلیغات
        </Button>
        <Button size="sm" variant="secondary" onClick={handleDecline}>
          بعداً
        </Button>
      </div>
    </div>
  );
}
