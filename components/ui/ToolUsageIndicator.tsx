'use client';

import { useEffect } from 'react';
import { useUsageLimits } from '@/shared/hooks/useUsageLimits';
import {
  incrementEngagement,
  markToolEngagementCounted,
  POPUP_TIMING,
  wasToolEngagementCounted,
} from '@/lib/client/popupEngagement';
import UpgradeModal from '@/components/UpgradeModal';

type Props = {
  toolId: string;
};

export default function ToolUsageIndicator({ toolId }: Props) {
  const { remaining, limit, showUpgrade, dismissUpgrade } = useUsageLimits(toolId);

  useEffect(() => {
    if (wasToolEngagementCounted(toolId)) {
      return;
    }

    const timer = setTimeout(() => {
      if (wasToolEngagementCounted(toolId)) {
        return;
      }
      markToolEngagementCounted(toolId);
      incrementEngagement();
    }, POPUP_TIMING.TOOL_ENGAGEMENT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [toolId]);

  if (remaining > 5) {
    return null;
  }

  return (
    <>
      {remaining > 0 ? (
        <div className="rounded-[var(--radius-md)] border border-[rgb(var(--color-warning-rgb)/0.3)] bg-[rgb(var(--color-warning-rgb)/0.1)] p-3 text-center text-sm text-[var(--color-warning)]">
          شما از {limit} استفاده رایگان امروز، {remaining} مورد باقی مانده است.
          {remaining <= 1 && (
            <span className="ms-2 font-semibold">برای استفاده نامحدود ارتقا دهید.</span>
          )}
        </div>
      ) : (
        <div className="rounded-[var(--radius-md)] border border-[rgb(var(--color-danger-rgb)/0.3)] bg-[rgb(var(--color-danger-rgb)/0.1)] p-3 text-center text-sm text-[var(--color-danger)]">
          سقف استفاده رایگان امروز تمام شد. فردا دوباره تلاش کنید یا اکنون ارتقا دهید.
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
