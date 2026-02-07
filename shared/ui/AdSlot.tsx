'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { recordAdClick, recordAdConsentAction, recordAdView } from '@/shared/analytics/ads';
import { getAdsConsent, updateAdsConsent, type AdsConsentState } from '@/shared/consent/adsConsent';
import { getOrAssignExperimentVariant } from '@/shared/monetization/adExperiment';

interface StaticAdSlotProps {
  slotId: string;
  campaignId?: string;
  imageUrl: string;
  alt: string;
  href: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: 'high' | 'normal' | 'low';
  showLabel?: boolean;
  experiment?: {
    key: string;
    control: {
      campaignId?: string;
      imageUrl: string;
      alt: string;
      href: string;
      priority?: 'high' | 'normal' | 'low';
      label?: string;
    };
    challenger: {
      campaignId?: string;
      imageUrl: string;
      alt: string;
      href: string;
      priority?: 'high' | 'normal' | 'low';
      label?: string;
    };
  };
}

export function StaticAdSlot({
  slotId,
  campaignId,
  imageUrl,
  alt,
  href,
  width = 728,
  height = 90,
  className = '',
  priority = 'normal',
  showLabel = true,
  experiment,
}: StaticAdSlotProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTracked, setHasTracked] = useState(false);
  const [consent, setConsent] = useState<AdsConsentState>(() => getAdsConsent());
  const ref = useRef<HTMLDivElement>(null);
  const [variantId, setVariantId] = useState<'control' | 'challenger'>(() => {
    if (!experiment || typeof window === 'undefined') {
      return 'control';
    }
    const selected = getOrAssignExperimentVariant(experiment.key, ['control', 'challenger']);
    return selected === 'challenger' ? 'challenger' : 'control';
  });

  useEffect(() => {
    if (!experiment || typeof window === 'undefined') {
      return;
    }
    const selected = getOrAssignExperimentVariant(experiment.key, ['control', 'challenger']);
    setVariantId(selected === 'challenger' ? 'challenger' : 'control');
  }, [experiment]);

  useEffect(() => {
    if (!ref.current || typeof window === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && !hasTracked) {
      const activeCampaignId =
        variantId === 'challenger'
          ? (experiment?.challenger.campaignId ?? campaignId)
          : (experiment?.control.campaignId ?? campaignId);
      recordAdView(slotId, activeCampaignId, variantId);
      setHasTracked(true);
    }
  }, [isVisible, hasTracked, slotId, campaignId, variantId, experiment]);

  const handleAccept = () => {
    const next = updateAdsConsent({ contextualAds: true, targetedAds: false });
    setConsent(next);
    recordAdConsentAction('accept', 'slot', slotId, variantId);
  };

  const handleDecline = () => {
    const next = updateAdsConsent({ contextualAds: false, targetedAds: false });
    setConsent(next);
    recordAdConsentAction('decline', 'slot', slotId, variantId);
  };

  const handleClick = () => {
    const activeCampaignId =
      variantId === 'challenger'
        ? (experiment?.challenger.campaignId ?? campaignId)
        : (experiment?.control.campaignId ?? campaignId);
    recordAdClick(slotId, activeCampaignId, variantId);
  };

  const activeCreative = variantId === 'challenger' ? experiment?.challenger : experiment?.control;
  const activeImageUrl = activeCreative?.imageUrl ?? imageUrl;
  const activeAlt = activeCreative?.alt ?? alt;
  const activeHref = activeCreative?.href ?? href;
  const activePriority = activeCreative?.priority ?? priority;
  const variantLabel = activeCreative?.label ?? (variantId === 'challenger' ? 'B' : 'A');

  const priorityClasses = {
    high: 'border-amber-200 dark:border-amber-800',
    normal: 'border-gray-200 dark:border-gray-700',
    low: 'border-gray-100 dark:border-gray-800',
  };

  if (!consent.contextualAds) {
    return (
      <div
        ref={ref}
        className={`rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-[var(--text-primary)] shadow-[var(--shadow-subtle)] ${className}`}
        style={{ maxWidth: width }}
      >
        <div className="flex flex-col gap-3">
          <div className="text-sm font-semibold">نمایش تبلیغات؟</div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            برای تامین هزینه‌ها از تبلیغات نمایشی استفاده می‌کنیم. اطلاعات شما ارسال نمی‌شود و فقط
            بنر محلی نمایش داده می‌شود.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-[var(--text-inverted)] shadow-[var(--shadow-subtle)]"
              onClick={handleAccept}
            >
              قبول نمایش تبلیغات
            </button>
            <button
              type="button"
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)]"
              onClick={handleDecline}
            >
              فعلاً نه
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`relative rounded-lg overflow-hidden border ${priorityClasses[activePriority]} ${className}`}
      style={{ maxWidth: width }}
      data-ad-variant={variantId}
      data-ad-slot={slotId}
    >
      {showLabel && (
        <span
          className="absolute top-2 text-xs bg-black/50 text-white px-2 py-1 rounded"
          style={{ insetInlineStart: '0.5rem' }}
        >
          تبلیغات A/B: {variantLabel}
        </span>
      )}
      <a
        href={activeHref}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className="block"
      >
        <Image
          src={activeImageUrl}
          alt={activeAlt}
          width={width}
          height={height}
          className="w-full h-auto object-contain"
          loading="lazy"
          sizes={`${width}px`}
        />
      </a>
    </div>
  );
}

interface AdContainerProps {
  children: ReactNode;
  className?: string;
}

export function AdContainer({ children, className = '' }: AdContainerProps) {
  return (
    <div
      className={`my-6 flex justify-center ${className}`}
      role="complementary"
      aria-label="Advertisement"
    >
      {children}
    </div>
  );
}
