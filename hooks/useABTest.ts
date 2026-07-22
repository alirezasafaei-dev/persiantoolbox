'use client';

import { useMemo } from 'react';
import { getVariant, type ABTestConfig } from '@/lib/ab-testing';

export function useABTest(config: ABTestConfig): string {
  return useMemo(() => getVariant(config), [config]);
}
