'use client';

import { useState, useEffect, useCallback } from 'react';

interface MarketData {
  timestamp: number;
  currencies: {
    [key: string]: {
      code: string;
      name: string;
      rate: number;
      change24h: number;
    };
  };
  gold: {
    pricePerGram: number;
    change24h: number;
  };
  crypto: {
    [key: string]: {
      symbol: string;
      name: string;
      priceUSD: number;
      change24h: number;
    };
  };
  sources: string[];
  freshness: 'live' | 'cached' | 'stale';
}

interface UseMarketDataResult {
  data: MarketData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMarketData(): UseMarketDataResult {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/market');
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }

      const result = await response.json();
      if (result.ok) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}
