'use client';

import { StaticAdSlot, AdContainer } from '@/shared/ui/AdSlot';

type Props = {
  placement: string;
};

export default function SiteAdBanner({ placement }: Props) {
  return (
    <AdContainer>
      <StaticAdSlot
        slotId={placement}
        imageUrl="/ads/placeholder-banner.png"
        alt="تبلیغات"
        href="/"
        width={728}
        height={90}
        showLabel={false}
      />
    </AdContainer>
  );
}
