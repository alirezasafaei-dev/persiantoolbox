'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'pt_usage';
const FREE_DAILY_LIMIT = 10;

interface ToolUsage {
  count: number;
  date: string;
}

interface UsageStore {
  [toolId: string]: ToolUsage;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0] as string;
}

function loadStore(): UsageStore {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as UsageStore;
  } catch {
    return {};
  }
}

function saveStore(store: UsageStore): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage full or unavailable
  }
}

export function getToolUsage(toolId: string): { used: number; remaining: number; limit: number } {
  const store = loadStore();
  const today = getToday();
  const entry = store[toolId];

  if (!entry || entry.date !== today) {
    return { used: 0, remaining: FREE_DAILY_LIMIT, limit: FREE_DAILY_LIMIT };
  }

  const remaining = Math.max(0, FREE_DAILY_LIMIT - entry.count);
  return { used: entry.count, remaining, limit: FREE_DAILY_LIMIT };
}

export function trackToolUsage(toolId: string): { allowed: boolean; remaining: number } {
  const store = loadStore();
  const today = getToday();
  const entry = store[toolId];

  if (!entry || entry.date !== today) {
    store[toolId] = { count: 1, date: today };
    saveStore(store);
    return { allowed: true, remaining: FREE_DAILY_LIMIT - 1 };
  }

  if (entry.count >= FREE_DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  saveStore(store);
  return { allowed: true, remaining: FREE_DAILY_LIMIT - entry.count };
}

export function useUsageLimits(toolId: string) {
  const [usage, setUsage] = useState(() => getToolUsage(toolId));
  const [showUpgrade, setShowUpgrade] = useState(false);

  const track = useCallback(() => {
    const result = trackToolUsage(toolId);
    setUsage(getToolUsage(toolId));
    if (!result.allowed) {
      setShowUpgrade(true);
    }
    return result;
  }, [toolId]);

  const dismissUpgrade = useCallback(() => {
    setShowUpgrade(false);
  }, []);

  const requestUpgrade = useCallback(() => {
    setShowUpgrade(true);
  }, []);

  useEffect(() => {
    setUsage(getToolUsage(toolId));
  }, [toolId]);

  return {
    used: usage.used,
    remaining: usage.remaining,
    limit: usage.limit,
    showUpgrade,
    track,
    dismissUpgrade,
    requestUpgrade,
  };
}
