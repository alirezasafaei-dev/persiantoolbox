import { NextResponse } from 'next/server';
import { logger } from '@/lib/server/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

// In-memory cache with 5-minute TTL
let cachedData: MarketData | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchMarketData(): Promise<MarketData> {
  const now = Date.now();

  // Return cached data if fresh
  if (cachedData && (now - cacheTimestamp) < CACHE_TTL) {
    return { ...cachedData, freshness: 'cached' };
  }

  const sources: string[] = [];

  try {
    // Fetch currency rates from a free API
    const currencyResponse = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD',
      { signal: AbortSignal.timeout(5000) },
    );

    if (currencyResponse.ok) {
      const currencyData = await currencyResponse.json();
      sources.push('exchangerate-api');

      const rates = currencyData.rates || {};

      cachedData = {
        timestamp: now,
        currencies: {
          USD: { code: 'USD', name: 'دلار آمریکا', rate: 1, change24h: 0 },
          EUR: { code: 'EUR', name: 'یورو', rate: rates.EUR || 0.92, change24h: 0 },
          GBP: { code: 'GBP', name: 'پوند انگلیس', rate: rates.GBP || 0.79, change24h: 0 },
          AED: { code: 'AED', name: 'درهم امارات', rate: rates.AED || 3.67, change24h: 0 },
          TRY: { code: 'TRY', name: 'لیر ترکیه', rate: rates.TRY || 32.5, change24h: 0 },
          IRR: { code: 'IRR', name: 'تومان ایران', rate: rates.IRR || 42000, change24h: 0 },
        },
        gold: {
          pricePerGram: 3200000, // Placeholder - would need real API
          change24h: 0,
        },
        crypto: {
          BTC: { symbol: 'BTC', name: 'بیت‌کوین', priceUSD: 65000, change24h: 0 },
          ETH: { symbol: 'ETH', name: 'اتریوم', priceUSD: 3500, change24h: 0 },
        },
        sources,
        freshness: 'live',
      };

      cacheTimestamp = now;
      return cachedData;
    }
  } catch (error) {
    logger.warn('Failed to fetch market data', { error: error instanceof Error ? error.message : String(error) });
  }

  // Return default data if fetch fails
  if (cachedData) {
    return { ...cachedData, freshness: 'stale' };
  }

  return {
    timestamp: now,
    currencies: {
      USD: { code: 'USD', name: 'دلار آمریکا', rate: 1, change24h: 0 },
      EUR: { code: 'EUR', name: 'یورو', rate: 0.92, change24h: 0 },
      GBP: { code: 'GBP', name: 'پوند انگلیس', rate: 0.79, change24h: 0 },
      AED: { code: 'AED', name: 'درهم امارات', rate: 3.67, change24h: 0 },
      TRY: { code: 'TRY', name: 'لیر ترکیه', rate: 32.5, change24h: 0 },
      IRR: { code: 'IRR', name: 'تومان ایران', rate: 42000, change24h: 0 },
    },
    gold: {
      pricePerGram: 3200000,
      change24h: 0,
    },
    crypto: {
      BTC: { symbol: 'BTC', name: 'بیت‌کوین', priceUSD: 65000, change24h: 0 },
      ETH: { symbol: 'ETH', name: 'اتریوم', priceUSD: 3500, change24h: 0 },
    },
    sources: ['default'],
    freshness: 'stale',
  };
}

export async function GET() {
  try {
    const data = await fetchMarketData();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    logger.error('Market data API error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ ok: false, error: 'Failed to fetch market data' }, { status: 500 });
  }
}
