'use client';

import { useEffect, useState } from 'react';
import { StaticAdSlot, AdContainer } from '@/shared/ui/AdSlot';

type Props = {
  placement: string;
};

type AdPayload = {
  placement: string;
  slotId: string;
  campaignId: string;
  imageUrl: string;
  targetUrl: string;
  alt: string;
};

const FALLBACK_AD: AdPayload = {
  placement: 'fallback',
  slotId: 'placeholder',
  campaignId: 'placeholder',
  imageUrl: '/ads/placeholder-banner.png',
  targetUrl: '/',
  alt: 'تبلیغات',
};

export default function SiteAdBanner({ placement }: Props) {
  const [ad, setAd] = useState<AdPayload | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch(`/api/ads?placement=${encodeURIComponent(placement)}`, {
          cache: 'no-store',
        });
        const payload = (await response.json()) as { ok?: boolean; ad?: AdPayload };
        if (!cancelled) {
          setAd(payload.ok && payload.ad ? payload.ad : { ...FALLBACK_AD, placement });
        }
      } catch {
        if (!cancelled) {
          setAd({ ...FALLBACK_AD, placement });
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [placement]);

  if (!ad) {
    return (
      <AdContainer>
        <div
          className="h-[90px] w-full max-w-[728px] animate-pulse rounded-lg bg-[var(--surface-1)]"
          aria-hidden="true"
        />
      </AdContainer>
    );
  }

  return (
    <AdContainer>
      <StaticAdSlot
        slotId={ad.slotId}
        campaignId={ad.campaignId}
        imageUrl={ad.imageUrl}
        alt={ad.alt}
        href={ad.targetUrl}
        width={728}
        height={90}
        showLabel={false}
      />
    </AdContainer>
  );
}
