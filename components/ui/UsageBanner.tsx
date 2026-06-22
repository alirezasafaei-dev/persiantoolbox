'use client';

import type { ReactNode } from 'react';
import { useUsageLimits } from '@/shared/hooks/useUsageLimits';
import UpgradeModal from '@/components/UpgradeModal';

type Props = {
  toolId: string;
  children: (props: { track: () => { allowed: boolean; remaining: number } }) => ReactNode;
};

export default function UsageBanner({ toolId, children }: Props) {
  const { remaining, limit, showUpgrade, track, dismissUpgrade } = useUsageLimits(toolId);

  return (
    <>
      {children({ track })}
      {remaining <= 3 && remaining > 0 && (
        <div className="rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 p-3 text-center text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          شما از {limit} استفاده رایگان امروز، {remaining} مورد باقی مانده است.
        </div>
      )}
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={dismissUpgrade}
        remainingUses={remaining}
        resetTime="فردا"
      />
    </>
  );
}
