'use client';

import { useUsageLimits } from '@/shared/hooks/useUsageLimits';
import UpgradeModal from '@/components/UpgradeModal';

type Props = {
  toolId: string;
};

export default function ToolUsageIndicator({ toolId }: Props) {
  const { remaining, limit, showUpgrade, dismissUpgrade } = useUsageLimits(toolId);

  if (remaining > 5) {
    return null;
  }

  return (
    <>
      {remaining > 0 ? (
        <div className="rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 p-3 text-center text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          شما از {limit} استفاده رایگان امروز، {remaining} مورد باقی مانده است.
          {remaining <= 1 && (
            <span className="mr-2 font-semibold">برای استفاده نامحدود ارتقا دهید.</span>
          )}
        </div>
      ) : (
        <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
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
