'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { recordPageView } from '@/shared/analytics/localUsage';
import { analytics } from '@/lib/monitoring';

export default function UsageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) {
      return;
    }
    recordPageView(pathname);
    analytics.trackEvent('page_view');
  }, [pathname]);

  return null;
}
